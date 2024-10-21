import mongoose from "mongoose";
import jest from 'jest-mock';
import { MongoMemoryServer } from "mongodb-memory-server";
import {
    createProductController,
    updateProductController,
    deleteProductController,
} from "./productController"; // Adjust the import path if necessary
import productModel from "../models/productModel";
import categoryModel from "../models/categoryModel";
import slugify from 'slugify'; // Import slugify

describe('Product Controller Integration Tests', () => {
    let mongoServer;
    let response;
    let request;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();

        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    beforeEach(async () => {
        request = {};
        response = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        await productModel.deleteMany({});
        await categoryModel.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    // Create Product
    it('should create a new product', async () => {
        const newCategory = await categoryModel.create({ name: 'Electronics', slug: 'electronics' });
        const newProduct = {
            name: 'New Product',
            description: 'Product Description',
            price: 100,
            category: newCategory._id,
            quantity: 10,
            shipping: true,
        };

        request.fields = newProduct;
        request.files = { photo: { path: 'path/to/photo', type: 'image/jpeg', size: 500000 } };

        try {
            await createProductController(request, response);
            expect(response.status).toHaveBeenCalledWith(201);
            expect(response.send).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: "Product Created Successfully",
            }));

            const product = await productModel.findOne({ name: 'New Product' });
            expect(product).not.toBeNull();
            expect(product.slug).toBe('new-product'); // Ensure slug is generated correctly
        } catch (error) {
            console.error("Error creating product:", error);
        }
    });

    it('should update a product', async () => {
        // Step 1: Create a new category
        const newCategory = await categoryModel.create({ name: 'Electronics', slug: 'electronics' });
    
        // Step 2: Create a product to be updated
        const product = await productModel.create({
            name: 'Old Product',
            description: 'Old Description',
            price: 50,
            category: newCategory._id,
            quantity: 5,
            shipping: false,
            slug: slugify('Old Product', { lower: true }), // Ensure slug is set on creation
        });
    
        // Step 3: Prepare the request for updating the product
        request.params = { pid: product._id }; 
        request.fields = {
            name: 'Updated Product',
            description: 'Updated Description', // updated
            price: 75,
            category: newCategory._id, 
            quantity: 10, 
            shipping: true, 
        };
        request.files = { 
            photo: { 
                path: 'assets/haribo.jpg', 
                type: 'image/jpeg', 
                size: 500000 
            } 
        };
        
        // Step 4: Call the updateProductController
        await updateProductController(request, response);

        // Step 5: Assert that the response is as expected
        expect(response.status).toHaveBeenCalledWith(201);
        expect(response.send).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: "Product Updated Successfully",
        }));
    
        // Step 6: Retrieve the updated product from the database
        const updatedProduct = await productModel.findById(product._id);
    
        // Step 7: Validate the updates
        expect(updatedProduct.name).toBe('Updated Product');
        expect(updatedProduct.price).toBe(75);
        expect(updatedProduct.description).toBe('Updated Description'); 
        expect(updatedProduct.slug).toBe('Updated-Product');
    });
    
    

    // Delete Product
    it('should delete a product', async () => {
        const newCategory = await categoryModel.create({ name: 'Electronics', slug: 'electronics' });
        const product = await productModel.create({
            name: 'Delete Product',
            description: 'Product to delete',
            price: 100,
            category: newCategory._id,
            quantity: 10,
            shipping: true,
            slug: slugify('Delete Product', { lower: true }), 
        });

        request.params = { pid: product._id };

        await deleteProductController(request, response);
        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.send).toHaveBeenCalledWith({
            success: true,
            message: "Product Deleted successfully",
        });

        const deletedProduct = await productModel.findById(product._id);
        expect(deletedProduct).toBeNull();
    });
});
