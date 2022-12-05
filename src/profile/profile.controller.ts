import { Controller , Body, Put, Param, UseGuards, } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorator';
import { user } from '@prisma/client';
import { ProfileDto } from './dto';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('profile')
export class ProfileController {
    constructor(private profileService: ProfileService){}

    @Put('updateProfile/:id')
    updateAddress(@GetUser() user: user,  @Body() dto:ProfileDto){
      return this.profileService.updateProfile(user, dto);
    }
}
