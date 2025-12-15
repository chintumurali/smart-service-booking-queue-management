/**
 * US-12: Role Restriction Testing
 * Tests to ensure unauthorized actions are prevented
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

describe('US-12: Role Restriction Testing', () => {
  let customerToken, providerToken, adminToken;
  let customerId, providerId, adminId;
  let serviceId;

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

    // Verify provider was created successfully
    if (!providerId) {
      throw new Error('Provider ID is undefined after upsert');
    }
    const verifyProvider = await prisma.user.findUnique({ where: { id: providerId } });
    if (!verifyProvider) {
      // If provider doesn't exist, create it directly
      const newProvider = await prisma.user.create({
        data: {
          fullName: 'Test Provider',
          email: 'provider@test.com',
          passwordHash: 'hashed',
          role: 'PROVIDER'
        }
      });
      providerId = newProvider.id;
      providerToken = generateToken(providerId, 'PROVIDER');
    }

    const admin = await prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: {
        fullName: 'Test Admin',
        passwordHash: 'hashed',
        role: 'ADMIN'
      },
      create: {
        fullName: 'Test Admin',
        email: 'admin@test.com',
        passwordHash: 'hashed',
        role: 'ADMIN'
      }
    });
    adminId = admin.id;
    adminToken = generateToken(adminId, 'ADMIN');

    // Create a test service for provider - delete existing first
    await prisma.service.deleteMany({ where: { providerId: providerId } }).catch(() => {});
    const service = await prisma.service.create({
      data: {
        providerId: providerId,
        title: 'Test Service',
        description: 'Test Description'
      }
    });
    serviceId = service.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.booking.deleteMany({});
    await prisma.service.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('Customer cannot create services', () => {
    test('Customer should receive 403 Forbidden when trying to create a service', async () => {
      const response = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          title: 'Unauthorized Service',
          description: 'This should fail'
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Forbidden');
    });

    test('Customer should receive 403 Forbidden when trying to view provider services', async () => {
      const response = await request(app)
        .get('/api/services/mine')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Forbidden');
    });
  });

  describe('Provider cannot create bookings', () => {
    test('Provider should receive 403 Forbidden when trying to create a booking', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          serviceId: serviceId,
          date: new Date().toISOString()
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Forbidden');
    });

    test('Provider should receive 403 Forbidden when trying to view customer bookings', async () => {
      const response = await request(app)
        .get('/api/bookings/mine')
        .set('Authorization', `Bearer ${providerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Forbidden');
    });
  });

  describe('Unauthenticated users cannot access protected routes', () => {
    test('Should receive 401 Unauthorized when accessing protected route without token', async () => {
      const response = await request(app)
        .get('/api/services/mine');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Missing token');
    });

    test('Should receive 401 Unauthorized when accessing protected route with invalid token', async () => {
      const response = await request(app)
        .get('/api/services/mine')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid token');
    });
  });

  describe('Valid role-based access', () => {
    test('Provider can create services', async () => {
      // Ensure provider exists
      let verifyProvider = await prisma.user.findUnique({ where: { id: providerId } });
      if (!verifyProvider) {
        const newProvider = await prisma.user.upsert({
          where: { email: 'provider@test.com' },
          update: { role: 'PROVIDER' },
          create: {
            fullName: 'Test Provider',
            email: 'provider@test.com',
            passwordHash: 'hashed',
            role: 'PROVIDER'
          }
        });
        providerId = newProvider.id;
        providerToken = generateToken(providerId, 'PROVIDER');
      }

      const response = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          title: 'Valid Service',
          description: 'This should work'
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Valid Service');
    });

    test('Customer can create bookings', async () => {
      // Ensure service exists - recreate if needed
      let currentServiceId = serviceId;
      let verifyService = await prisma.service.findUnique({ where: { id: serviceId } });
      if (!verifyService) {
        // Ensure provider exists
        let currentProviderId = providerId;
        let verifyProvider = await prisma.user.findUnique({ where: { id: providerId } });
        if (!verifyProvider) {
          const newProvider = await prisma.user.upsert({
            where: { email: 'provider@test.com' },
            update: { role: 'PROVIDER' },
            create: {
              fullName: 'Test Provider',
              email: 'provider@test.com',
              passwordHash: 'hashed',
              role: 'PROVIDER'
            }
          });
          currentProviderId = newProvider.id;
          providerId = currentProviderId;
          providerToken = generateToken(providerId, 'PROVIDER');
        }
        // Recreate service
        const newService = await prisma.service.create({
          data: {
            providerId: currentProviderId,
            title: 'Test Service',
            description: 'Test Description'
          }
        });
        currentServiceId = newService.id;
        serviceId = currentServiceId;
      }

      // Ensure customer exists
      let verifyCustomer = await prisma.user.findUnique({ where: { id: customerId } });
      if (!verifyCustomer) {
        const newCustomer = await prisma.user.upsert({
          where: { email: 'customer@test.com' },
          update: { role: 'CUSTOMER' },
          create: {
            fullName: 'Test Customer',
            email: 'customer@test.com',
            passwordHash: 'hashed',
            role: 'CUSTOMER'
          }
        });
        customerId = newCustomer.id;
        customerToken = generateToken(customerId, 'CUSTOMER');
      }

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceId: currentServiceId,
          date: new Date().toISOString()
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('queueNumber');
    });

    test('Admin can access provider routes', async () => {
      const response = await request(app)
        .get('/api/services/mine')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Provider can only update bookings for their own services', () => {
    test('Provider should receive 403 when trying to update booking for another provider\'s service', async () => {
      // Ensure customer exists - recreate if needed
      let testCustomerId = customerId;
      let testCustomer = await prisma.user.findUnique({ where: { id: customerId } });
      if (!testCustomer) {
        // Recreate customer if it was deleted
        testCustomer = await prisma.user.create({
          data: {
            fullName: 'Test Customer',
            email: `customer${Date.now()}@test.com`,
            passwordHash: 'hashed',
            role: 'CUSTOMER'
          }
        });
        testCustomerId = testCustomer.id;
      }

      // Create another provider and their service
      const otherProvider = await prisma.user.create({
        data: {
          fullName: 'Other Provider',
          email: `otherprovider${Date.now()}@test.com`, // Unique email to avoid conflicts
          passwordHash: 'hashed',
          role: 'PROVIDER'
        }
      });

      const otherService = await prisma.service.create({
        data: {
          providerId: otherProvider.id,
          title: 'Other Service',
          description: 'Other Description'
        }
      });

      // Create a booking for the other provider's service
      const booking = await prisma.booking.create({
        data: {
          customerId: testCustomerId,
          serviceId: otherService.id,
          date: new Date(),
          queueNumber: 1
        }
      });

      // Try to update it with the first provider's token
      const response = await request(app)
        .patch(`/api/bookings/${booking.id}/status`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          status: 'SERVING'
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Forbidden');

      // Cleanup
      await prisma.booking.delete({ where: { id: booking.id } }).catch(() => {});
      await prisma.service.delete({ where: { id: otherService.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: otherProvider.id } }).catch(() => {});
      // Only delete test customer if we created it
      if (testCustomerId !== customerId) {
        await prisma.user.delete({ where: { id: testCustomerId } }).catch(() => {});
      }
    });
  });
});

