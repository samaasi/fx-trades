import { Controller, Get, Post, Body, UseGuards, Request, UseInterceptors } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';
import { IdempotencyInterceptor } from '../../common/interceptors/idempotency.interceptor';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getBalances(@Request() req) {
    return this.walletService.getBalances(req.user.userId);
  }

  @Post('fund')
  @UseInterceptors(IdempotencyInterceptor)
  async fund(@Request() req, @Body() fundWalletDto: FundWalletDto) {
    return this.walletService.fund(req.user.userId, fundWalletDto);
  }

  @Post('convert')
  @UseInterceptors(IdempotencyInterceptor)
  async convert(@Request() req, @Body() convertDto: ConvertCurrencyDto) {
    return this.walletService.convert(req.user.userId, convertDto);
  }

  @Post('trade')
  @UseInterceptors(IdempotencyInterceptor)
  async trade(@Request() req, @Body() tradeDto: ConvertCurrencyDto) {
    return this.walletService.trade(req.user.userId, tradeDto);
  }
}
