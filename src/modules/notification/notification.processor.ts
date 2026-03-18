import { Process, Processor } from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import type { Job } from 'bull';
import type { IMailProvider } from './providers/mail.provider.interface';
import { MAIL_PROVIDER } from '../../common/constants/tokens';

@Processor('notification')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    @Inject(MAIL_PROVIDER)
    private readonly mailProvider: IMailProvider,
  ) {}

  @Process('sendVerificationEmail')
  async handleSendVerificationEmail(job: Job<{ to: string; subject: string; body: string }>) {
    this.logger.log(`Processing verification email job for ${job.data.to}`);
    const { to, subject, body } = job.data;
    
    try {
      await this.mailProvider.sendMail(to, subject, body);
      this.logger.log(`Verification email sent successfully for ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email for ${to}`, error.stack);
      throw error;
    }
  }
}
