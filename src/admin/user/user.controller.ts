import { Controller, Get,UseGuards, } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUser } from 'src/auth/decorator';
import { user } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('user')
export class UserController {
    constructor(private userServive: UserService){
    }

    @Get('getAllUser')
    getAllUser(@GetUser() user: user){
    return this.userServive.getAllUser(user);
    }

}
