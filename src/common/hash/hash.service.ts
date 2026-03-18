import { Injectable, Inject } from '@nestjs/common';
import type { IHashProvider } from './IHashProvider';

import { HASH_PROVIDER } from '../constants/tokens';

@Injectable()
export class HashService {
  constructor(
    @Inject(HASH_PROVIDER)
    private readonly hashProvider: IHashProvider,
  ) {}

  async hash(value: string): Promise<string> {
    return this.hashProvider.hash(value);
  }

  async verify(hash: string, value: string): Promise<boolean> {
    return this.hashProvider.verify(hash, value);
  }
}
