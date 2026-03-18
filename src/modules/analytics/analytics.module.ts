import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Ledger } from '../transaction/entities/ledger.entity';
import { Transaction } from '../transaction/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ledger, Transaction])],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
