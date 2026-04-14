import { Module } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [
    UserRepository,
    TransactionRepository,
    PrismaService,
  ],
  exports: [
    UserRepository,
    TransactionRepository,
  ],
})
export class RepositoriesModule {}
