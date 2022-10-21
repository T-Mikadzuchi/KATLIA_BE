import { JwtGuard } from './../auth/guard/jwt.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { GetUser } from './../auth/decorator';
import { user } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('user')
export class UserController {
  @Get('me')
  getMe(@GetUser() user: user) {
    return user;
  }
}
