import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { Ledger } from './entities/ledger.entity';
import { TransactionService } from './transaction.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Ledger])],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
