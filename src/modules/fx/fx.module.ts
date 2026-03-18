import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FxService } from './fx.service';
import { ExchangeRateProvider } from './providers/exchangerate.provider';

@Global()
@Module({
  imports: [HttpModule],
  providers: [
    {
      provide: 'IFxProvider',
      useClass: ExchangeRateProvider,
    },
    FxService,
    ExchangeRateProvider,
  ],
  exports: [FxService],
})
export class FxModule {}
