import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthService } from '../src/modules/auth/auth.service';

describe('Authentication E2E Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    authService = moduleFixture.get<AuthService>(AuthService);

    await app.init();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data
    await prismaService.user.deleteMany({
      where: { email: { contains: 'test@example.com' } }
    });
  });

  describe('POST /auth/signup', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'newuser@test.com',
        password: 'StrongPass123!',
        fullName: 'Test User'
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.fullName).toBe(userData.fullName);
    });

    it('should prevent duplicate email registration', async () => {
      const userData = {
        email: 'duplicate@test.com',
        password: 'StrongPass123!',
        fullName: 'Test User'
      };

      // First registration
      await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send(userData)
        .expect(201);

      // Second registration with same email
      await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send(userData)
        .expect(409);
    });

    it('should validate email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'StrongPass123!',
        fullName: 'Test User'
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send(userData)
        .expect(400);
    });

    it('should require strong password', async () => {
      const userData = {
        email: 'weakpass@test.com',
        password: '123',
        fullName: 'Test User'
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send(userData)
        .expect(400);
    });
  });

  describe('POST /auth/signin', () => {
    beforeEach(async () => {
      // Create a test user
      await authService.signUp({
        email: 'signin@test.com',
        password: 'TestPass123!',
        fullName: 'Test User'
      });
    });

    it('should authenticate valid credentials', async () => {
      const loginData = {
        email: 'signin@test.com',
        password: 'TestPass123!'
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/signin')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(loginData.email);
    });

    it('should reject invalid credentials', async () => {
      const loginData = {
        email: 'signin@test.com',
        password: 'WrongPassword'
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/signin')
        .send(loginData)
        .expect(401);
    });

    it('should reject non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'SomePass123!'
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/signin')
        .send(loginData)
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    let validToken: string;
    let refreshToken: string;

    beforeEach(async () => {
      // Create and login a test user
      const response = await authService.signUp({
        email: 'refresh@test.com',
        password: 'TestPass123!',
        fullName: 'Test User'
      });
      validToken = response.accessToken;
      refreshToken = response.refreshToken;
    });

    it('should refresh valid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.accessToken).not.toBe(validToken);
    });

    it('should reject invalid token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should reject requests without token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    let validToken: string;

    beforeEach(async () => {
      const response = await authService.signUp({
        email: 'profile@test.com',
        password: 'TestPass123!',
        fullName: 'Test User'
      });
      validToken = response.accessToken;
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('fullName');
      expect(response.body.email).toBe('profile@test.com');
    });

    it('should reject invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should reject requests without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limiting on auth endpoints', async () => {
      const loginData = {
        email: 'ratelimit@test.com',
        password: 'WrongPassword'
      };

      // Make multiple requests to trigger rate limit
      for (let i = 0; i < 101; i++) {
        if (i < 100) {
          await request(app.getHttpServer())
            .post('/api/v1/auth/signin')
            .send(loginData);
        } else {
          // 101st request should be rate limited
          await request(app.getHttpServer())
            .post('/api/v1/auth/signin')
            .send(loginData)
            .expect(400);
        }
      }
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer some-token');

      // Check for security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
      
      if (process.env.NODE_ENV === 'production') {
        expect(response.headers).toHaveProperty('strict-transport-security');
      }
    });
  });
});
