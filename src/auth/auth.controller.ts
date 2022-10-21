import { AuthDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signUpByEmailAndOTP')
  @ApiBody({
    schema: {
      properties: {
        'email': { type: 'string' },
        'otp': { type: 'number' }
      }
    }
  })
  signup(@Body() dto: any) {
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
}
