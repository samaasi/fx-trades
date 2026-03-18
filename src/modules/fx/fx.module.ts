import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FxService } from './fx.service';
import { FxController } from './fx.controller';
import { ExchangeRateProvider } from './providers/exchangerate.provider';

import { FX_PROVIDER } from '../../common/constants/tokens';

@Global()
@Module({
  imports: [HttpModule],
  providers: [
    {
      provide: FX_PROVIDER,
      useClass: ExchangeRateProvider,
    },
    FxService,
    ExchangeRateProvider,
  ],
  controllers: [FxController],
  exports: [FxService],
})
export class FxModule {}
