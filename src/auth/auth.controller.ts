import { VerifyDto } from './dto/verify.dto';
import { AuthDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { Body, Controller, Patch, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signUpByEmailAndOTP')
  signup(@Body() dto: VerifyDto) {
    return this.authService.signUpByEmailAndOTP(dto);
  }

  @Post('signInWithEmailAndPassword')
  signin(@Body() dto: AuthDto) {
    return this.authService.signInWithEmailAndPassword(dto);
  }
  
  @Post('verifyEmailForSignUp')
  @ApiBody({
    schema: {
      properties: {
        'email': { type: 'string' },
        'password': { type: 'string' },
        'name': { type: 'string' }
      }
    }
  })
  verifyEmail(@Body() dto: any) {
    return this.authService.verifyEmailForSignUp(dto);
  }

  @Post('verifyEmailForgotPassword')
  @ApiBody({
    schema: {
      properties: {
        'email': { type: 'string' },
      }
    }
  })
  verifyEmailForgotPassword(@Body() dto: any) {
    return this.authService.verifyEmailForgotPassword(dto.email);
  }

  @Post('checkOTPForgotPassword')
  checkOTPForgotPassword(@Body() dto: VerifyDto) {
    return this.authService.checkOTPForgotPassword(dto);
  }

  @Patch('newPasswordAfterVerify')
  newPasswordAfterVerify(@Body() dto: AuthDto) {
    return this.authService.newPasswordAfterVerify(dto)
  }
}
