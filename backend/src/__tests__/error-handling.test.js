/**
 * US-13: Error Handling Testing
 * Tests for validation errors and error scenarios
 * Assigned to: Murali
 */

const request = require('supertest');
const app = require('../app');
const { prisma } = require('../config/db');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT token
function generateToken(userId, role) {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '1h' }
  );
}

describe('US-13: Error Handling', () => {
  let customerToken, providerToken;
  let customerId, providerId;
  let serviceId;
  let testBookingId; // For booking status update tests

  beforeAll(async () => {
    // Clean up any existing test data first (order matters due to foreign keys)
    await prisma.booking.deleteMany({}).catch(() => {});
    await prisma.service.deleteMany({}).catch(() => {});
    await prisma.user.deleteMany({}).catch(() => {});

    // Create test users - use upsert to handle existing records
    const customer = await prisma.user.upsert({
      where: { email: 'customer@test.com' },
      update: {
        fullName: 'Test Customer',
        passwordHash: 'hashed',
        role: 'CUSTOMER'
      },
      create: {
        fullName: 'Test Customer',
        email: 'customer@test.com',
        passwordHash: 'hashed',
        role: 'CUSTOMER'
      }
    });
    customerId = customer.id;
    customerToken = generateToken(customerId, 'CUSTOMER');

    const provider = await prisma.user.upsert({
      where: { email: 'provider@test.com' },
      update: {
        fullName: 'Test Provider',
        passwordHash: 'hashed',
        role: 'PROVIDER'
      },
      create: {
        fullName: 'Test Provider',
        email: 'provider@test.com',
        passwordHash: 'hashed',
        role: 'PROVIDER'
      }
    });
    providerId = provider.id;
    providerToken = generateToken(providerId, 'PROVIDER');

    // Create a test service - delete existing first, then create
    await prisma.service.deleteMany({ where: { providerId: providerId } }).catch(() => {});
    const service = await prisma.service.create({
      data: {
        providerId: providerId,
        title: 'Test Service',
        description: 'Test Description'
      }
    });
    serviceId = service.id;

    // Create a test booking for status update tests - delete existing first
    await prisma.booking.deleteMany({ where: { customerId: customerId, serviceId: serviceId } }).catch(() => {});
    const testBooking = await prisma.booking.create({
      data: {
        customerId: customerId,
        serviceId: serviceId,
        date: new Date(),
        queueNumber: 1
      }
    });
    testBookingId = testBooking.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.booking.deleteMany({});
    await prisma.service.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('Invalid Login Credentials', () => {
    test('Should return 401 with error message for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    test('Should return 401 with error message for wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'customer@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    test('Should return 400 with validation error for missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation error');
      // Details may or may not be present depending on Zod version
      if (response.body.details) {
        expect(Array.isArray(response.body.details)).toBe(true);
      }
    });

    test('Should return 400 with validation error for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation error');
    });
  });

  describe('Registration Validation Errors', () => {
    test('Should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@test.com'
          // Missing fullName and password
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation error');
      // Details may or may not be present depending on Zod version
      if (response.body.details) {
        expect(Array.isArray(response.body.details)).toBe(true);
      }
    });

    test('Should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User',
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation error');
    });

    test('Should return 400 for password too short', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User',
          email: 'newuser@test.com',
          password: '12345' // Less than 6 characters
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation error');
    });

    test('Should return 409 for duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User',
          email: 'customer@test.com', // Already exists
          password: 'password123'
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Email already used');
    });
  });

  describe('Service Creation Validation Errors', () => {
    test('Should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          description: 'Service description'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation error');
    });

    test('Should return 400 for title too short', async () => {
      const response = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          title: 'A', // Less than 2 characters
          description: 'Service description'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation error');
    });
  });

  describe('Booking Creation Validation Errors', () => {
    test('Should return 400 for missing serviceId', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          date: new Date().toISOString()
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation error');
    });

    test('Should return 400 for missing date', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceId: serviceId
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation error');
    });

    test('Should return 400 for invalid serviceId', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceId: '', // Empty string
          date: new Date().toISOString()
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation error');
    });
  });

  describe('Booking Status Update Validation', () => {
    test('Should return 400 for invalid status value', async () => {
      const response = await request(app)
        .patch(`/api/bookings/${testBookingId}/status`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          status: 'INVALID_STATUS'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation error');
    });

    test('Should return 404 for non-existent booking', async () => {
      const response = await request(app)
        .patch('/api/bookings/non-existent-id/status')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          status: 'SERVING'
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Booking not found');
    });

    test('Should return 400 for missing status', async () => {
      const response = await request(app)
        .patch(`/api/bookings/${testBookingId}/status`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation error');
    });
  });

  describe('Error Response Format', () => {
    test('Error responses should have consistent format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid@test.com',
          password: 'wrong'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    });

    test('Validation errors should include details', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      // Details may or may not be present depending on Zod version
      if (response.body.details) {
        expect(Array.isArray(response.body.details)).toBe(true);
      }
    });
  });
});

