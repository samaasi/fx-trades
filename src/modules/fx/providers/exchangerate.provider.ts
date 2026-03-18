import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { IFxProvider } from './fx.provider.interface';

@Injectable()
export class ExchangeRateProvider implements IFxProvider {
  private readonly logger = new Logger(ExchangeRateProvider.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('fx.exchangeRate.apiKey') || '';
    this.baseUrl = this.configService.get<string>('fx.exchangeRate.baseUrl') || 'https://v6.exchangerate-api.com/v6/';
  }

  async getLatestRates(baseCurrency: string): Promise<Record<string, number>> {
    try {
      const url = `${this.baseUrl}${this.apiKey}/latest/${baseCurrency}`;
      const response = await lastValueFrom(this.httpService.get(url));
      
      if (response.data.result === 'success') {
        return response.data.conversion_rates;
      }
      
      throw new Error(response.data['error-type'] || 'Failed to fetch FX rates');
    } catch (error) {
      this.logger.error(`Error fetching latest rates for ${baseCurrency}: ${error.message}`);
      throw new InternalServerErrorException('Could not fetch real-time FX rates');
    }
  }

  async getConversionRate(from: string, to: string): Promise<number> {
    try {
      const url = `${this.baseUrl}${this.apiKey}/pair/${from}/${to}`;
      const response = await lastValueFrom(this.httpService.get(url));
      
      if (response.data.result === 'success') {
        return response.data.conversion_rate;
      }
      
      throw new Error(response.data['error-type'] || 'Failed to fetch conversion rate');
    } catch (error) {
      this.logger.error(`Error fetching conversion rate from ${from} to ${to}: ${error.message}`);
      throw new InternalServerErrorException('Could not fetch real-time FX conversion rate');
    }
  }
}
