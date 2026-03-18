import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Transaction, TransactionType, TransactionStatus } from './entities/transaction.entity';
import { Ledger, EntryType } from './entities/ledger.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Ledger)
    private readonly ledgerRepository: Repository<Ledger>,
  ) {}

  /**
   * Records a user transaction and its ledger entries in a single transaction
   * @param manager Transactional entity manager
   */
  async recordTransaction(
    manager: EntityManager,
    data: {
      userId: string;
      type: TransactionType;
      amount: number;
      currency: string;
      reference?: string;
      metadata?: any;
      ledgerEntries: Array<{
        currency: string;
        entryType: EntryType;
        amount: number;
        balanceBefore: number;
        balanceAfter: number;
        description: string;
      }>;
    },
  ): Promise<Transaction> {
    const transaction = manager.create(Transaction, {
      userId: data.userId,
      type: data.type,
      amount: data.amount,
      currency: data.currency,
      status: TransactionStatus.COMPLETED,
      reference: data.reference,
      metadata: data.metadata,
    });

    const savedTransaction = await manager.save(transaction);

    for (const entry of data.ledgerEntries) {
      const ledgerEntry = manager.create(Ledger, {
        transactionId: savedTransaction.id,
        userId: data.userId,
        currency: entry.currency,
        entryType: entry.entryType,
        amount: entry.amount,
        balanceBefore: entry.balanceBefore,
        balanceAfter: entry.balanceAfter,
        description: entry.description,
      });
      await manager.save(ledgerEntry);
    }

    return savedTransaction;
  }
}
