import { Injectable, Inject } from '@nestjs/common';
import type { IHashProvider } from './IHashProvider';

@Injectable()
export class HashService {
  constructor(
    @Inject('IHashProvider')
    private readonly hashProvider: IHashProvider,
  ) {}

  async hash(value: string): Promise<string> {
    return this.hashProvider.hash(value);
  }

  async verify(hash: string, value: string): Promise<boolean> {
    return this.hashProvider.verify(hash, value);
  }
}
