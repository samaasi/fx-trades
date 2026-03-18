import { Module } from '@nestjs/common';
import { HashService } from './hash.service';
import { Argon2Provider } from './providers/argon2.provider';

@Module({
  providers: [
    {
      provide: 'IHashProvider',
      useClass: Argon2Provider,
    },
    HashService,
  ],
  exports: [HashService],
})
export class HashModule {}
