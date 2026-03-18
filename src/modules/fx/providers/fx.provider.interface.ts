export interface IFxProvider {
  getLatestRates(baseCurrency: string): Promise<Record<string, number>>;
  getConversionRate(from: string, to: string): Promise<number>;
}
