import mongoose from "mongoose";
import jest from 'jest-mock';
import { MongoMemoryServer } from "mongodb-memory-server";
import { loginController, registerController, updateProfileController } from "./authController";
import userModel from '../models/userModel';
import { hashPassword, comparePassword } from "../helpers/authHelper";

let mongoServer;
let response;
let request;
let testUser;

beforeAll(async () => {
  process.env.JWT_SECRET = 'dummy-secret-key'; // Set the JWT secret
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Authentication Controller Integration Tests', () => {
  beforeEach(async () => {
    request = {};
    response = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    await userModel.deleteMany();

    const hashedPassword = await hashPassword('password123');
    testUser = await userModel.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      phone: '1234567890',
      address: '123 Test St',
      answer: 'test sport',
      role: 0 // 0 for user, 1 for admin
    });
  });

  it('should login successfully with a pre-existing user', async () => {
    const authData = {
      email: 'test@example.com',
      password: 'password123'
    };
    request.body = authData;
    await loginController(request, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.send).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: "login successfully"
    }));
  });

  it('should fail login with no existing user (wrong email)', async () => {
    const authData = {
      email: 'nonexistent@example.com',
      password: 'password123'
    };
    request.body = authData;
    await loginController(request, response);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.send).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Email is not registerd'
    }));
  });

  it('should fail login with a pre-existing user (wrong password)', async () => {
    const authData = {
      email: 'test@example.com',
      password: 'wrongpassword'
    };
    request.body = authData;
    await loginController(request, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.send).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Invalid Password'
    }));
  });

  it('should timeout when login due to no database connection', async () => {
    await mongoose.disconnect(); // Simulate disconnection

    const authData = {
      email: 'test@example.com',
      password: 'password123'
    };
    request.body = authData;
    await loginController(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Error in login',
    }));

    // Reconnect to the database for remaining tests
    await mongoose.connect(mongoServer.getUri());
  });

  it('should successfully register a non-duplicate user', async () => {
    const registerData = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'newpassword',
      phone: '0987654321',
      address: '123 Street',
      answer: 'new answer'
    };
    request.body = registerData;
    await registerController(request, response);

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.send).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: 'User Register Successfully',
      user: expect.objectContaining({
        email: 'newuser@example.com'
      }),
    }));
  });

  it('should fail registration with a duplicate user (same email)', async () => {
    const registerData = {
      name: 'Existing User',
      email: 'test@example.com',
      password: await hashPassword('password123'),
      phone: '1234567890',
      address: '123 Street',
      answer: 'some answer'
    };
    request.body = registerData;
    await registerController(request, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.send).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Already Register please login'
    }));
  });

  it('should successfully update the profile', async () => {
    request.user = { _id: testUser._id }; // Simulate the authenticated user

    const updateData = {
      name: 'Updated User',
      phone: '0987654321',
      address: '456 Updated St',
      password: 'newpassword123'
    };
    request.body = updateData;
    await updateProfileController(request, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.send).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser: expect.objectContaining({
        name: 'Updated User',
        phone: '0987654321',
        address: '456 Updated St'
      }),
    }));

    // Verify that the password was updated and hashed correctly
    const updatedUser = await userModel.findById(testUser._id); // Fetch the updated user from the database
    const isPasswordMatch = await comparePassword('newpassword123', updatedUser.password);
    expect(isPasswordMatch).toBe(true);
  });

  it('should fail to update profile with too short password', async () => {
    request.user = { _id: testUser._id }; // Simulate the authenticated user

    const updateData = {
      password: '123' // Too short
    };
    request.body = updateData;
    await updateProfileController(request, response);

    const error = new TypeError("res.json is not a function");
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.send).toHaveBeenCalledWith(expect.objectContaining({
      error: error,
      message: "Error WHile Update profile",
      success: false
    }));
  });

  it('should fail to update profile for non-existing user', async () => {
    request.user = { _id: new mongoose.Types.ObjectId() }; // Simulate a non-existing user ID

    const updateData = {
      name: 'Non-existing User',
      email: 'nonexisting@example.com',
      phone: '1111111111',
      address: '789 Non-existing St',
    };
    request.body = updateData;
    await updateProfileController(request, response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.send).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "Error WHile Update profile",
    }));
  });
});
