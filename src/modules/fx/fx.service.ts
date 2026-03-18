import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IFxProvider } from './providers/fx.provider.interface';
import { RedisService } from '../../infrastructure/cache/redis.service';

import { FX_PROVIDER } from '../../common/constants/tokens';

@Injectable()
export class FxService {
  private readonly cacheTtl: number;
  private readonly staleTtl: number;

  constructor(
    @Inject(FX_PROVIDER)
    private readonly fxProvider: IFxProvider,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.cacheTtl = this.configService.get<number>('fx.exchangeRate.cacheTtl') || 3600;
    this.staleTtl = this.configService.get<number>('fx.exchangeRate.staleTtl') || 86400;
  }

  async getLatestRates(baseCurrency: string = 'NGN'): Promise<Record<string, number>> {
    const cacheKey = `fx_rates_${baseCurrency}`;
    const freshKey = `fx_rates_${baseCurrency}_fresh`;

    const isFresh = await this.redisService.get(freshKey);
    const cachedData = await this.redisService.get(cacheKey);

    if (isFresh && cachedData) {
      return JSON.parse(cachedData);
    }

    if (cachedData) {
      const staleRates = JSON.parse(cachedData);
      this.refreshRates(baseCurrency, cacheKey, freshKey).catch(() => {
        /* silent background failure */
      });
      return staleRates;
    }

    return this.refreshRates(baseCurrency, cacheKey, freshKey);
  }

  private async refreshRates(
    baseCurrency: string,
    cacheKey: string,
    freshKey: string,
  ): Promise<Record<string, number>> {
    let lastError: Error | undefined;
    for (let i = 0; i < 3; i++) {
      try {
        const rates = await this.fxProvider.getLatestRates(baseCurrency);
        await this.redisService.set(cacheKey, JSON.stringify(rates), this.staleTtl);
        await this.redisService.set(freshKey, 'true', this.cacheTtl);
        return rates;
      } catch (error) {
        lastError = error as Error;
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw lastError || new Error('Failed to refresh FX rates');
  }

  async getConversionRate(from: string, to: string): Promise<number> {
    const cacheKey = `fx_rate_${from}_${to}`;
    const freshKey = `fx_rate_${from}_${to}_fresh`;

    const isFresh = await this.redisService.get(freshKey);
    const cachedData = await this.redisService.get(cacheKey);

    if (isFresh && cachedData) {
      return parseFloat(cachedData);
    }

    if (cachedData) {
      const staleRate = parseFloat(cachedData);
      this.refreshConversionRate(from, to, cacheKey, freshKey).catch(() => {});
      return staleRate;
    }

    return this.refreshConversionRate(from, to, cacheKey, freshKey);
  }

  private async refreshConversionRate(
    from: string,
    to: string,
    cacheKey: string,
    freshKey: string,
  ): Promise<number> {
    let lastError: Error | undefined;
    for (let i = 0; i < 3; i++) {
      try {
        const rate = await this.fxProvider.getConversionRate(from, to);
        await this.redisService.set(cacheKey, rate.toString(), this.staleTtl);
        await this.redisService.set(freshKey, 'true', this.cacheTtl);
        return rate;
      } catch (error) {
        lastError = error as Error;
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw lastError || new Error('Failed to refresh conversion rate');
  }

  async checkProviderHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: string;
    lastChecked: string;
  }> {
    try {
      await this.fxProvider.getLatestRates('USD');
      return {
        status: 'healthy',
        details: 'FX provider is responsive and returning data.',
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      const cachedData = await this.redisService.get(`fx_rates_USD`);
      if (cachedData) {
        return {
          status: 'degraded',
          details: `FX provider error: ${error.message}. Serving stale data from cache.`,
          lastChecked: new Date().toISOString(),
        };
      }
      return {
        status: 'unhealthy',
        details: `FX provider error: ${error.message}. No stale data available.`,
        lastChecked: new Date().toISOString(),
      };
    }
  }
}
