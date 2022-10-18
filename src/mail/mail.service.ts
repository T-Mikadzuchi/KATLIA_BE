import { PrismaService } from './../prisma/prisma.service';
import { MailDto } from './dto/mail.dto';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(
    private config: ConfigService,
    private mailerService: MailerService,
    private prisma: PrismaService,
  ) {}
  async verifyEmail(dto: MailDto) {
    const otp = Math.floor(Math.random() * (1000000 - 100000) + 100000);
    await this.mailerService.sendMail({
      to: dto.email,
      from: this.config.get('MAIL_FROM'),
      subject: 'Verification code from Katlia Fashion',
      text: 'Pls enter your verification code: ' + otp,
    });
    await this.prisma.mail_otp.create({
      data: {
        email: dto.email,
        otp,
      },
    });
    return { message: 'OTP sent' };
  }
}
