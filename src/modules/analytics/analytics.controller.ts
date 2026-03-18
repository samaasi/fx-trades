import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * GET /api/v1/analytics/volume
   * Get trading volume by currency
   */
  @Get('volume')
  async getTradingVolume(
    @Query('currency') currency: string = 'NGN',
    @Query('days') days: number = 1,
  ) {
    return this.analyticsService.getTradingVolume(currency, days);
  }

  /**
   * GET /api/v1/analytics/popular-pairs
   * Get the most popular currency pairs
   */
  @Get('popular-pairs')
  async getPopularPairs(@Query('limit') limit: number = 5) {
    return this.analyticsService.getPopularCurrencyPairs(limit);
  }

  /**
   * GET /api/v1/analytics/activity
   * Get general user activity distribution
   */
  @Get('activity')
  async getActivityDistribution() {
    return this.analyticsService.getUserActivityDistribution();
  }
}
