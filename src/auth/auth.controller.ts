import { VerifyDto } from './dto/verify.dto';
import { AuthDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { Body, Controller, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signUpByEmailAndOTP')
  async signup(@Body() dto: VerifyDto) {
    return await this.authService.signUpByEmailAndOTP(dto);
  }

  @Post('signInWithEmailAndPassword')
  async signin(@Body() dto: AuthDto) {
    return await this.authService.signInWithEmailAndPassword(dto);
  }

  @Post('verifyEmailForSignUp')
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
        name: { type: 'string' },
      },
    },
  })
  async verifyEmail(@Body() dto: any) {
    return await this.authService.verifyEmailForSignUp(dto);
  }

  @Post('verifyEmailForgotPassword')
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string' },
      },
    },
  })
  async verifyEmailForgotPassword(@Body() dto: any) {
    return await this.authService.verifyEmailForgotPassword(dto.email);
  }

  @Post('checkOTPForgotPassword')
  async checkOTPForgotPassword(@Body() dto: VerifyDto) {
    return await this.authService.checkOTPForgotPassword(dto);
  }

  @Patch('newPasswordAfterVerify')
  async newPasswordAfterVerify(@Body() dto: AuthDto) {
    return await this.authService.newPasswordAfterVerify(dto);
  }
}
