import mongoose from "mongoose";
import jest from 'jest-mock';
import { MongoMemoryServer } from "mongodb-memory-server";
import { categoryControlller, createCategoryController, deleteCategoryCOntroller, singleCategoryController, updateCategoryController } from "./categoryController";
import categoryModel from "../models/categoryModel";

describe('Category Controller Integration Tests', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();

        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

    });

    let response;
    let request;

    beforeEach(async () => {
        request = {};
        response = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        await categoryModel.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    // create category
    it('should create a new category', async () => {
        const newCategory = { name: 'new_Category', slug: 'new_category' };

        request.body = newCategory;
        await createCategoryController(request, response);
        expect(response.status).toHaveBeenCalledWith(201);
        expect(response.send).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: "new category created",
        }));

        const category = await categoryModel.findOne({ name: 'new_Category' });
        expect(category).not.toBeNull();
        expect(category.slug).toBe('new_category');
    });

    it('should not create a duplicate category', async () => {
        const existingCategory = { name: 'duplicate_Category' };
        await new categoryModel(existingCategory).save();

        request.body = existingCategory;

        await createCategoryController(request, response);

        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.send).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: "Category Already Exisits",
        }));

        const categories = await categoryModel.find({ name: 'duplicate_Category' });
        expect(categories).toHaveLength(1);
    });


    // get all categories
    it('should get all categories', async () => {
        await new categoryModel({ name: "category_1", slug: "c1" }).save();
        await new categoryModel({ name: "category_2", slug: "c2" }).save();

        await categoryControlller(request, response);

        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.send).toHaveBeenCalledWith({
            success: true,
            message: 'All Categories List',
            category: expect.arrayContaining([
                expect.objectContaining({ name: 'category_1', slug: 'c1' }),
                expect.objectContaining({ name: 'category_2', slug: 'c2' }),
            ]),
        });
    })

    // delete category
    it('should delete a category with id', async () => {
        const category = await new categoryModel({ name: "category_1", slug: "c1" }).save();

        request.params = { id: category._id };

        await deleteCategoryCOntroller(request, response);

        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.send).toHaveBeenCalledWith({
            success: true,
            message: 'Categry Deleted Successfully',
        });

        const categories = await categoryModel.find({ name: 'category_1' });
        expect(categories).toHaveLength(0);
    });

    // single category
    it('should get a single category', async () => {
        const category = await new categoryModel({ name: "category_1", slug: "c1" }).save();

        request.params = { slug: category.slug };

        await singleCategoryController(request, response);

        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.send).toHaveBeenCalledWith({
            success: true,
            message: 'Get SIngle Category SUccessfully',
            category: expect.objectContaining({ name: 'category_1', slug: 'c1' }),
        });
    });

    // update category
    it('should update a category', async () => {
        const category = await new categoryModel({ name: "category_1", slug: "c1" }).save();

        request.params = { id: category._id };
        request.body = { name: 'updated_category'};

        await updateCategoryController(request, response);

        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.send).toHaveBeenCalledWith({
            success: true,
            messsage: 'Category Updated Successfully',
            category: expect.objectContaining({
                _id: category._id,
                name: 'updated_category',
                slug: 'updated_category',
                __v: 0,
            },)
        });

        const updatedCategory = await categoryModel.findById(category._id);
        expect(updatedCategory).toMatchObject({ name: 'updated_category', slug: 'updated_category' });
    });

});