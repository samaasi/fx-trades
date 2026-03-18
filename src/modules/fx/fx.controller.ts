import { Controller, Get, Query } from '@nestjs/common';
import { FxService } from './fx.service';

@Controller('fx')
export class FxController {
  constructor(private readonly fxService: FxService) {}

  @Get('rates')
  async getLatestRates(@Query('base') base: string = 'NGN') {
    return this.fxService.getLatestRates(base);
  }

  @Get('health')
  async getHealth() {
    return this.fxService.checkProviderHealth();
  }
}
