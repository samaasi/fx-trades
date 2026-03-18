import { Injectable, Inject } from '@nestjs/common';
import type { IFxProvider } from './providers/fx.provider.interface';

@Injectable()
export class FxService {
  constructor(
    @Inject('IFxProvider')
    private readonly fxProvider: IFxProvider,
  ) {}

  async getLatestRates(baseCurrency: string = 'NGN'): Promise<Record<string, number>> {
    return this.fxProvider.getLatestRates(baseCurrency);
  }

  async getConversionRate(from: string, to: string): Promise<number> {
    return this.fxProvider.getConversionRate(from, to);
  }
}
