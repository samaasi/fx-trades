import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Ledger, EntryType } from '../transaction/entities/ledger.entity';
import { Transaction, TransactionType } from '../transaction/entities/transaction.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Ledger)
    private readonly ledgerRepository: Repository<Ledger>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  /**
   * Get total trading volume for a specific currency within a time range
   */
  async getTradingVolume(currency: string, days: number = 1) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.ledgerRepository
      .createQueryBuilder('ledger')
      .select('SUM(ledger.amount)', 'total')
      .where('ledger.currency = :currency', { currency })
      .andWhere('ledger.createdAt >= :startDate', { startDate })
      .andWhere('ledger.entryType = :entryType', { entryType: EntryType.CREDIT }) // Assuming credit represents inflow/trade completion
      .getRawOne();

    return {
      currency,
      totalVolume: parseFloat(result.total || '0'),
      periodDays: days,
    };
  }

  /**
   * Get the most popular currency pairs based on transaction frequency
   */
  async getPopularCurrencyPairs(limit: number = 5) {
    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select("transaction.metadata->>'toCurrency'", 'toCurrency')
      .addSelect('transaction.currency', 'fromCurrency')
      .addSelect('COUNT(*)', 'count')
      .where('transaction.type = :type', { type: TransactionType.CONVERT })
      .orWhere('transaction.type = :tradeType', { tradeType: TransactionType.TRADE })
      .groupBy('fromCurrency')
      .addGroupBy('toCurrency')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map(row => ({
      pair: `${row.fromCurrency}/${row.toCurrency}`,
      count: parseInt(row.count, 10),
    }));
  }

  /**
   * Get general user activity distribution (Fund vs Trade vs Convert)
   */
  async getUserActivityDistribution() {
    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('transaction.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('transaction.type')
      .getRawMany();

    return result.map(row => ({
      type: row.type,
      count: parseInt(row.count, 10),
    }));
  }
}
