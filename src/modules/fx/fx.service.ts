import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IFxProvider } from './providers/fx.provider.interface';
import { RedisService } from '../../infrastructure/cache/redis.service';

@Injectable()
export class FxService {
  private readonly cacheTtl: number;

  constructor(
    @Inject('IFxProvider')
    private readonly fxProvider: IFxProvider,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.cacheTtl = this.configService.get<number>('fx.exchangeRate.cacheTtl') || 3600;
  }

  async getLatestRates(baseCurrency: string = 'NGN'): Promise<Record<string, number>> {
    const cacheKey = `fx_rates_${baseCurrency}`;
    const cachedRates = await this.redisService.get(cacheKey);

    if (cachedRates) {
      return JSON.parse(cachedRates);
    }

    const rates = await this.fxProvider.getLatestRates(baseCurrency);
    await this.redisService.set(cacheKey, JSON.stringify(rates), this.cacheTtl);

    return rates;
  }

  async getConversionRate(from: string, to: string): Promise<number> {
    const cacheKey = `fx_rate_${from}_${to}`;
    const cachedRate = await this.redisService.get(cacheKey);

    if (cachedRate) {
      return parseFloat(cachedRate);
    }

    const rate = await this.fxProvider.getConversionRate(from, to);
    await this.redisService.set(cacheKey, rate.toString(), this.cacheTtl);

    return rate;
  }
}
