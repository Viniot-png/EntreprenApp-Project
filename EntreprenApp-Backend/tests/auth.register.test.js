import { jest } from '@jest/globals';
import httpMocks from 'node-mocks-http';
import { register } from '../controllers/auth.controller.js';
import * as bcrypt from 'bcrypt';
import * as mailService from '../nodemailer/emails.js';

// Mock User model
jest.unstable_mockModule('../models/user.model.js', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
  }
}));

// Mock bcrypt
jest.unstable_mockModule('bcrypt', () => ({
  __esModule: true,
  default: {
    hash: jest.fn().mockResolvedValue('hashed_password_123'),
  }
}));

// Mock email service
jest.unstable_mockModule('../nodemailer/emails.js', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
}));

// Mock cloudinary
jest.unstable_mockModule('cloudinary', () => ({
  __esModule: true,
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockResolvedValue({ secure_url: 'https://example.com/doc.pdf', public_id: 'test_123' }),
    }
  }
}));

let User;

describe('Auth - Register Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new entrepreneur user successfully', async () => {
    const { register: registerController } = await import('../controllers/auth.controller.js');
    const UserModel = (await import('../models/user.model.js')).default;

    // Mock findOne to return null (user doesn't exist)
    UserModel.findOne.mockResolvedValue(null);

    // Mock create to return a new user
    const newUser = {
      _id: 'user_123',
      username: 'johndoe',
      fullname: 'John Doe',
      email: 'john@example.com',
      role: 'entrepreneur',
      verificationCode: '123456',
      password: undefined,
    };
    UserModel.create.mockResolvedValue(newUser);

    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/api/auth/register',
      body: {
        username: 'johndoe',
        fullname: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'entrepreneur',
        sector: 'Technology',
      }
    });

    const res = httpMocks.createResponse();

    await registerController(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.user).toBeDefined();
  });

  it('should return 400 if email already exists', async () => {
    const { register: registerController } = await import('../controllers/auth.controller.js');
    const UserModel = (await import('../models/user.model.js')).default;

    // Mock findOne to return an existing user
    UserModel.findOne.mockResolvedValue({ _id: 'existing_user' });

    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/api/auth/register',
      body: {
        username: 'johndoe',
        fullname: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'entrepreneur',
        sector: 'Technology',
      }
    });

    const res = httpMocks.createResponse();

    await registerController(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(false);
    expect(data.message).toContain('already taken');
  });

  it('should return 400 if required fields are missing', async () => {
    const { register: registerController } = await import('../controllers/auth.controller.js');

    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/api/auth/register',
      body: {
        username: 'johndoe',
        fullname: 'John Doe',
        // Missing email, password, role
      }
    });

    const res = httpMocks.createResponse();

    await registerController(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(false);
    expect(data.message).toContain('Validation');
  });

  it('should accept registration without location field', async () => {
    const { register: registerController } = await import('../controllers/auth.controller.js');
    const UserModel = (await import('../models/user.model.js')).default;

    UserModel.findOne.mockResolvedValue(null);

    const newUser = {
      _id: 'user_123',
      username: 'johndoe',
      fullname: 'John Doe',
      email: 'john@example.com',
      role: 'investor',
      verificationCode: '123456',
      password: undefined,
    };
    UserModel.create.mockResolvedValue(newUser);

    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/api/auth/register',
      body: {
        username: 'johndoe',
        fullname: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'investor',
        sector: 'Finance',
        professionalEmail: 'john.professional@example.com',
        // NO LOCATION FIELD - should still work
      }
    });

    const res = httpMocks.createResponse();

    await registerController(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
  });
});
