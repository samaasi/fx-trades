import { Module } from '@nestjs/common';
import { HashService } from './hash.service';
import { Argon2Provider } from './providers/argon2.provider';
import { HASH_PROVIDER } from '../constants/tokens';

@Module({
  providers: [
    {
      provide: HASH_PROVIDER,
      useClass: Argon2Provider,
    },
    HashService,
  ],
  exports: [HashService],
})
export class HashModule {}
