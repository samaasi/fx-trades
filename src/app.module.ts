import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import configuration from './config/configuration';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { NotificationModule } from './modules/notification/notification.module';
import { FxModule } from './modules/fx/fx.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { RedisModule } from './infrastructure/cache/redis.module';
import { typeOrmConfig } from './infrastructure/database/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          password: configService.get('redis.password'),
        },
      }),
      inject: [ConfigService],
    }),
    RedisModule,
    NotificationModule,
    FxModule,
    UserModule,
    AuthModule,
    WalletModule,
    TransactionModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
