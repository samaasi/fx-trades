import * as ejs from 'ejs';
import type { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, Inject } from '@nestjs/common';
import type { IMailProvider } from './providers/mail.provider.interface';
import { createTemplateReader } from '../../common/utils/template.util';

@Injectable()
export class NotificationService {
  private readonly readTemplate = createTemplateReader(
    __dirname,
    'src/modules/notification/templates',
  );

  constructor(
    @Inject('IMailProvider')
    private readonly mailProvider: IMailProvider,
    @InjectQueue('notification')
    private readonly notificationQueue: Queue,
  ) {}

  async sendVerificationEmail(to: string, otp: string): Promise<void> {
    const subject = 'Verify your email';
    const template = this.readTemplate('verification.ejs');

    const body = ejs.render(template, { otp, expiresAt: 10 });
  
    await this.notificationQueue.add('sendVerificationEmail', {
      to,
      subject,
      body,
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
  }
}
