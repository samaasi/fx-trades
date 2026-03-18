import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  async getHistory(@Request() req) {
    return this.transactionService.getTransactionHistory(req.user.userId);
  }

  @Get('ledger')
  async getLedger(@Request() req) {
    return this.transactionService.getLedgerEntries(req.user.userId);
  }
}
