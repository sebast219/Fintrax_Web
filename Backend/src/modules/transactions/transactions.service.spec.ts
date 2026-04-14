import { Test } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createTestingModule, mockUser, mockAccount, mockTransaction } from '../../../test/setup';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { TransactionType } from '@prisma/client';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    transaction: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    account: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    category: {
      findFirst: jest.fn(),
    },
    card: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module = await createTestingModule(
      [],
      [
        {
          provide: TransactionsService,
          useFactory: () => new TransactionsService(mockPrismaService as any),
        },
      ],
    );

    service = module.get<TransactionsService>(TransactionsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an expense transaction successfully', async () => {
      const createDto = {
        accountId: mockAccount.id,
        categoryId: 'test-category-id',
        type: TransactionType.EXPENSE,
        amount: 50,
        description: 'Test expense',
        transactionDate: '2024-11-15',
      };

      const expectedTransaction = {
        ...mockTransaction,
        ...createDto,
      };

      mockPrismaService.account.findFirst.mockResolvedValue(mockAccount);
      mockPrismaService.category.findFirst.mockResolvedValue({ id: 'test-category-id' });
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });
      mockPrismaService.transaction.create.mockResolvedValue(expectedTransaction);

      const result = await service.create(mockUser.id, createDto);

      expect(result).toEqual(expectedTransaction);
    });

    it('should throw ForbiddenException if account does not exist', async () => {
      const createDto = {
        accountId: 'non-existent-account',
        categoryId: 'test-category-id',
        type: TransactionType.EXPENSE,
        amount: 50,
        description: 'Test expense',
        transactionDate: '2024-11-15',
      };

      mockPrismaService.account.findFirst.mockResolvedValue(null);

      await expect(service.create(mockUser.id, createDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should create a transfer transaction successfully', async () => {
      const targetAccount = { ...mockAccount, id: 'target-account-id', balance: 500 };
      
      const createDto = {
        accountId: mockAccount.id,
        categoryId: 'test-category-id',
        type: TransactionType.TRANSFER,
        amount: 100,
        description: 'Transfer',
        transactionDate: '2024-11-15',
        transferAccountId: targetAccount.id,
      };

      mockPrismaService.account.findFirst
        .mockResolvedValueOnce(mockAccount)
        .mockResolvedValueOnce(targetAccount);
      
      mockPrismaService.category.findFirst.mockResolvedValue({ id: 'test-category-id' });
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });

      const expectedTransaction = {
        ...mockTransaction,
        ...createDto,
      };

      mockPrismaService.transaction.create.mockResolvedValue(expectedTransaction);

      const result = await service.create(mockUser.id, createDto);

      expect(result).toEqual(expectedTransaction);
    });
  });

  describe('search', () => {
    it('should return transactions for user', async () => {
      const searchDto = {
        page: 1,
        pageSize: 10,
      };

      const expectedTransactions = [mockTransaction];

      mockPrismaService.$transaction.mockResolvedValue([
        expectedTransactions,
        1,
      ]);

      const result = await service.search(mockUser.id, searchDto);

      expect(result.data).toEqual(expectedTransactions);
      expect(result.meta.pagination.total).toBe(1);
      expect(result.meta.pagination.page).toBe(1);
      expect(result.meta.pagination.pageSize).toBe(10);
    });

    it('should filter transactions by type', async () => {
      const searchDto = {
        page: 1,
        pageSize: 10,
        type: TransactionType.EXPENSE,
      };

      const expectedTransactions = [{ ...mockTransaction, type: TransactionType.EXPENSE }];

      mockPrismaService.$transaction.mockResolvedValue([
        expectedTransactions,
        1,
      ]);

      const result = await service.search(mockUser.id, searchDto);

      expect(result.data).toEqual(expectedTransactions);
    });
  });

  describe('findOne', () => {
    it('should return transaction if it belongs to user', async () => {
      mockPrismaService.transaction.findFirst.mockResolvedValue(mockTransaction);

      const result = await service.findOne(mockUser.id, mockTransaction.id);

      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException if transaction does not exist', async () => {
      mockPrismaService.transaction.findFirst.mockResolvedValue(null);

      await expect(service.findOne(mockUser.id, 'non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update transaction successfully', async () => {
      const updateDto = {
        description: 'Updated description',
        amount: 75,
      };

      const expectedTransaction = {
        ...mockTransaction,
        ...updateDto,
      };

      mockPrismaService.transaction.findFirst.mockResolvedValue(mockTransaction);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });
      mockPrismaService.transaction.update.mockResolvedValue(expectedTransaction);

      const result = await service.update(mockUser.id, mockTransaction.id, updateDto);

      expect(result).toEqual(expectedTransaction);
    });
  });

  describe('delete', () => {
    it('should delete transaction successfully', async () => {
      mockPrismaService.transaction.findFirst.mockResolvedValue(mockTransaction);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });
      mockPrismaService.transaction.delete.mockResolvedValue(mockTransaction);

      const result = await service.delete(mockUser.id, mockTransaction.id);

      expect(result).toEqual({ deleted: true });
    });
  });
});
