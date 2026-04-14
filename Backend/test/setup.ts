import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

export const createTestingModule = async (controllers: any[], providers: any[] = []) => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
        load: [
          () => ({
            NODE_ENV: 'test',
            JWT_SECRET: 'test-secret',
            JWT_EXPIRES_IN: '1h',
            DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
          }),
        ],
      }),
      JwtModule.register({
        secret: 'test-secret',
        signOptions: { expiresIn: '1h' },
      }),
    ],
    controllers,
    providers: [
      {
        provide: PrismaService,
        useValue: {
          user: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
          account: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
          transaction: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
          $transaction: jest.fn(),
          $connect: jest.fn(),
          $disconnect: jest.fn(),
        },
      },
      ...providers,
    ],
  }).compile();

  return module;
};

export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  passwordHash: 'hashed-password',
  fullName: 'Test User',
  currency: 'USD',
  locale: 'es',
  timezone: 'America/Mexico_City',
  preferences: {},
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockAccount = {
  id: 'test-account-id',
  userId: 'test-user-id',
  name: 'Test Account',
  type: 'CHECKING',
  balance: 1000,
  initialBalance: 1000,
  currency: 'USD',
  color: '#3B82F6',
  icon: 'wallet',
  isActive: true,
  isArchived: false,
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockTransaction = {
  id: 'test-transaction-id',
  userId: 'test-user-id',
  accountId: 'test-account-id',
  categoryId: 'test-category-id',
  type: 'EXPENSE',
  amount: 50,
  description: 'Test transaction',
  transactionDate: new Date(),
  isConfirmed: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};
