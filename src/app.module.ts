import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { UserModule } from './modules/user/user.module';
import { RedisModule } from './infrastructure/cache/redis.module';
import { typeOrmConfig } from './infrastructure/database/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    RedisModule,

    
    UserModule,
  ],
})
export class AppModule {}
