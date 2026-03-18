import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entity';
import { RegisterDto } from './dto/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { HashService } from '../../common/hash/hash.service';
import { OtpService } from '../../common/otp/otp.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly notificationService: NotificationService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await this.hashService.hash(password);
    const { code: otp, expiresAt: otpExpiresAt } = this.otpService.generate();

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      otp,
      otpExpiresAt,
      isVerified: false,
    });

    await this.userRepository.save(user);

    await this.notificationService.sendVerificationEmail(email, otp);

    return {
      message: 'User registered successfully. Please verify your email with the OTP sent.',
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp } = verifyOtpDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('User is already verified');
    }

    if (!this.otpService.isValid(user.otp, otp, user.otpExpiresAt)) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;

    await this.userRepository.save(user);

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Email verified successfully',
      accessToken,
    };
  }
}
