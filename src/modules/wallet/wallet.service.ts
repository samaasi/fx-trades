import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';
import { FxService } from '../fx/fx.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly fxService: FxService,
    private readonly dataSource: DataSource,
  ) {}

  async getBalances(userId: string): Promise<Record<string, number>> {
    let wallet = await this.walletRepository.findOne({ where: { userId } });

    if (!wallet) {
      wallet = this.walletRepository.create({ userId, balances: {} });
      await this.walletRepository.save(wallet);
    }

    return wallet.balances;
  }

  async fund(userId: string, fundWalletDto: FundWalletDto): Promise<Record<string, number>> {
    const { amount, currency } = fundWalletDto;

    return await this.dataSource.transaction(async (manager) => {
      let wallet = await manager.findOne(Wallet, {
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        wallet = manager.create(Wallet, { userId, balances: {} });
      }

      const currentBalance = wallet.balances[currency] || 0;
      wallet.balances[currency] = currentBalance + amount;

      await manager.save(wallet);
      return wallet.balances;
    });
  }

  async convert(userId: string, convertDto: ConvertCurrencyDto): Promise<Record<string, number>> {
    const { fromCurrency, toCurrency, amount } = convertDto;

    const rate = await this.fxService.getConversionRate(fromCurrency, toCurrency);
    const convertedAmount = amount * rate;

    return await this.dataSource.transaction(async (manager) => {
      const wallet = await manager.findOne(Wallet, {
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet || (wallet.balances[fromCurrency] || 0) < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      wallet.balances[fromCurrency] -= amount;
      wallet.balances[toCurrency] = (wallet.balances[toCurrency] || 0) + convertedAmount;

      await manager.save(wallet);
      return wallet.balances;
    });
  }
}
