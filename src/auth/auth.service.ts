import { VerifyDto } from './dto/verify.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { AuthDto } from './dto/auth.dto';
import { PrismaService } from './../prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mailerService: MailerService,
  ) {}
  async signUpByEmailAndOTP(dto: VerifyDto) {
    try {
      //find mail
      const mailOTP = await this.prisma.mail_otp.findUnique({
        where: {
          email: dto.email,
        },
      });

      //save new user in db
      if (mailOTP && dto.otp == mailOTP.otp) {
        const user = await this.prisma.user.create({
          data: {
            email: mailOTP.email,
            password: mailOTP.password,
            fullName: mailOTP.name,
          },
        });

        await this.prisma.customer.create({
          data: {
            userId: user.id,
          },
        });

        await this.prisma.mail_otp.delete({
          where: {
            email: dto.email,
          },
        });

        delete user.password;
        return this.signToken(user.id, user.email);
      }
      return {
        message: "OTP's incorrect or email's invalid",
      };
    } catch (error) {
      throw error;
    }
  }

  async signInWithEmailAndPassword(dto: AuthDto) {
    //find user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    //if user not exist throw
    if (!user) {
      throw new ForbiddenException("User's not exist");
    }
    //compare password
    const pwMatches = await argon.verify(user.password, dto.password);
    //if password incorrect throw
    if (!pwMatches) throw new ForbiddenException('Password incorrect');
    //send back user
    delete user.password;
    return this.signToken(user.id, user.email);
  }

  async signToken(userId: string, email: string) {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      // expiresIn: '24h',
      secret: secret,
    });
    return {
      access_token: token,
    };
  }

  async verifyEmailForSignUp(dto: any) {
    const otp = Math.floor(Math.random() * (1000000 - 100000) + 100000);
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (user) {
      return new ForbiddenException('Credential taken');
    }

    const mailOTP = await this.prisma.mail_otp.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (mailOTP)
      await this.prisma.mail_otp.delete({
        where: {
          email: dto.email,
        },
      });

    await this.mailerService.sendMail({
      to: dto.email,
      from: this.config.get('MAIL_FROM'),
      subject: 'Verification code from Katlia Fashion',
      text: 'Please enter your verification code: ' + otp,
    });

    //generate password hash
    const hash = await argon.hash(dto.password);

    const save = await this.prisma.mail_otp.create({
      data: {
        email: dto.email,
        password: hash,
        name: dto.name,
        otp,
      },
    });
    return {
      message: 'OTP sent',
      email: save.email,
    };
  }

  async verifyEmailForgotPassword(email: string) {
    const otp = Math.floor(Math.random() * (1000000 - 100000) + 100000);
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      throw new ForbiddenException("Email doesn't exist in our system");
    }
    const mailOTP = await this.prisma.mail_otp.findUnique({
      where: {
        email,
      },
    });

    if (mailOTP)
      await this.prisma.mail_otp.delete({
        where: {
          email,
        },
      });

    await this.mailerService.sendMail({
      to: email,
      from: this.config.get('MAIL_FROM'),
      subject: 'Reset password verification code from Katlia Fashion',
      text: 'Please enter your verification code: ' + otp,
    });

    const save = await this.prisma.mail_otp.create({
      data: {
        email,
        otp,
      },
    });

    return {
      message: 'OTP sent',
      email: save.email,
    };
  }

  async checkOTPForgotPassword(dto: VerifyDto) {
    const mailOTP = await this.prisma.mail_otp.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (mailOTP && dto.otp == mailOTP.otp) {
      return {
        email: mailOTP.email,
        message: 'OTP correct',
      };
    } else throw new ForbiddenException('OTP incorrect');
  }

  async newPasswordAfterVerify(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) throw new ForbiddenException('WTF');

    const hash = await argon.hash(dto.password);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hash,
      },
    });
    return 'Password changed';
  }
}
