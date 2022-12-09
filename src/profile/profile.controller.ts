import { Controller , Body, Put, Param, UseGuards, Get} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorator';
import { user } from '@prisma/client';
import { ProfileDto } from './dto';
import { get } from 'http';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('profile')
export class ProfileController {
    constructor(private profileService: ProfileService){}

    @Put('updateProfile/:id')
    updateAddress(@GetUser() user: user,  @Body() dto:ProfileDto){
      return this.profileService.updateProfile(user, dto);
    }

    @Get('getProfile')
    getProfile(@GetUser() user: user){
      this.profileService.getProfile(user);
    }

}
