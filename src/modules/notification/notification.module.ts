import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { NotificationService } from './notification.service';
import { SmtpProvider } from './providers/smtp.provider';
import { NotificationProcessor } from './notification.processor';

@Global()
@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: 'notification',
    }),
  ],
  providers: [
    {
      provide: 'IMailProvider',
      useClass: SmtpProvider,
    },
    NotificationService,
    NotificationProcessor,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
