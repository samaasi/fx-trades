import { Injectable } from '@nestjs/common';

export interface OtpResponse {
  code: string;
  expiresAt: Date;
}

@Injectable()
export class OtpService {
  /**
   * Generates a numeric OTP code and an expiration timestamp.
   * @param length The length of the OTP code (default: 6)
   * @param ttlMinutes Time to live in minutes (default: 10)
   */
  generate(length: number = 6, ttlMinutes: number = 10): OtpResponse {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    const code = Math.floor(min + Math.random() * (max - min + 1)).toString();
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    return { code, expiresAt };
  }

  /**
   * Validates if the provided OTP matches and is not expired.
   * @param storedCode The code saved in the database
   * @param providedCode The code from the user
   * @param expiresAt The expiration timestamp from the database
   */
  isValid(storedCode: string | null, providedCode: string, expiresAt: Date | null): boolean {
    if (!storedCode || !providedCode || !expiresAt) return false;
    return storedCode === providedCode && new Date() < expiresAt;
  }
}
