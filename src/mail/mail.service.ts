import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host: host ?? 'smtp.gmail.com',
        port: Number(port),
        secure: Number(port) === 465,
        auth: {
          user,
          pass,
        },
      });
      this.logger.log('Nodemailer SMTP Transporter initialized successfully');
    } else {
      this.logger.warn(
        'SMTP credentials not set in .env. Falling back to test JSON mail transport.',
      );
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  async sendPasswordResetEmail(
    toEmail: string,
    otp: string,
  ): Promise<boolean> {
    const from =
      this.configService.get<string>('FROM_EMAIL') ??
      '"Secure Notes API" <noreply@securenotes.com>';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 25px; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2c3e50; margin-top: 0;">Password Reset OTP</h2>
        <p>You requested a password reset for your Secure Notes account.</p>
        <p>Your 6-digit verification OTP code is:</p>
        <div style="background: #eef2f7; padding: 16px 24px; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1a73e8; border-radius: 8px; display: inline-block; margin: 15px 0;">
          ${otp}
        </div>
        <p style="margin-top: 15px; color: #666; font-size: 14px;">
          This OTP code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">If you did not request this password reset, please ignore this email.</p>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from,
        to: toEmail,
        subject: `${otp} is your Password Reset OTP - Secure Notes API`,
        html: htmlContent,
      });

      this.logger.log(`Password reset OTP email sent to ${toEmail}`);
      if (info.message) {
        this.logger.debug(`Mail Payload: ${info.message}`);
      }
      return true;
    } catch (error: any) {
      this.logger.error(
        `Failed to send OTP email to ${toEmail}: ${error.message}`,
      );
      return false;
    }
  }
}
