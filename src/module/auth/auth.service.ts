import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { UserRole } from '../../common/enums/user-role.enum.js';
import { User, UserDocument } from '../../database/schemas/user.schema.js';
import { MailService } from '../../mail/mail.service.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) { }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessSecret =
      this.configService.get<string>('JWT_ACCESS_SECRET') ??
      this.configService.get<string>('JWT_SECRET') ??
      'secure_notes_access_secret_key_12345';

    const accessExpiresIn =
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m';

    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ??
      'secure_notes_refresh_secret_key_67890';

    const refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessSecret,
      expiresIn: accessExpiresIn as any,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn as any,
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { refreshToken: hashedRefreshToken } },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userModel.findOne({
      email: registerDto.email.toLowerCase(),
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newUser = await this.userModel.create({
      name: registerDto.name,
      email: registerDto.email.toLowerCase(),
      password: hashedPassword,
      role: UserRole.USER, // Public registration strictly defaults to USER
      interests: registerDto.interests ?? [],
    });

    const tokens = await this.generateTokens(
      newUser._id.toString(),
      newUser.email,
      newUser.role,
    );

    return {
      message: 'User registered successfully',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        interests: newUser.interests,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userModel.findOne({
      email: loginDto.email.toLowerCase(),
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(
      user._id.toString(),
      user.email,
      user.role,
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        interests: user.interests,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-password -refreshToken -resetPasswordOtp -resetPasswordOtpExpires')
      .exec();

    if (!user) {
      throw new NotFoundException('Authenticated user profile not found');
    }

    return user;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({
      email: forgotPasswordDto.email.toLowerCase(),
    });

    if (!user) {
      return {
        message:
          'If an account with that email exists, a 6-digit OTP code has been sent.',
      };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = expires;
    await user.save();

    await this.mailService.sendPasswordResetEmail(user.email, otp);

    return {
      message: '6-digit OTP code sent successfully to your email address.',
      otp,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const submittedOtp = String(resetPasswordDto.otp).trim();

    const user = await this.userModel.findOne({
      resetPasswordOtp: submittedOtp,
    });

    if (!user || !user.resetPasswordOtpExpires) {
      throw new BadRequestException(
        'Invalid or expired 6-digit OTP verification code',
      );
    }

    if (new Date() > new Date(user.resetPasswordOtpExpires)) {
      throw new BadRequestException(
        'The 6-digit OTP code has expired. Please request a new one.',
      );
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();

    return {
      message:
        'Password has been reset successfully. You can now login with your new password.',
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ??
      'secure_notes_refresh_secret_key_67890';

    try {
      const payload = await this.jwtService.verifyAsync(
        refreshTokenDto.refreshToken,
        {
          secret: refreshSecret,
        },
      );

      const user = await this.userModel.findById(payload.sub);
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Access denied: Invalid refresh token');
      }

      const isRefreshTokenMatching = await bcrypt.compare(
        refreshTokenDto.refreshToken,
        user.refreshToken,
      );

      if (!isRefreshTokenMatching) {
        throw new UnauthorizedException('Access denied: Invalid refresh token');
      }

      const tokens = await this.generateTokens(
        user._id.toString(),
        user.email,
        user.role,
      );

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch {
      throw new UnauthorizedException(
        'Access denied: Invalid or expired refresh token',
      );
    }
  }
}
