import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { IMailProvider } from './mail.provider.interface';

@Injectable()
export class SmtpProvider implements IMailProvider {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(SmtpProvider.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('smtp.host'),
      port: this.configService.get<number>('smtp.port'),
      secure: this.configService.get<number>('smtp.port') === 465,
      auth: {
        user: this.configService.get<string>('smtp.user'),
        pass: this.configService.get<string>('smtp.pass'),
      },
    });
  }

  async sendMail(to: string, subject: string, body: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('smtp.from'),
        to,
        subject,
        html: body,
      });
      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.stack);
      // In production, we might want to throw here depending on retry logic
    }
  }
}
