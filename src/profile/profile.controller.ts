import { UploadedFileMetadata } from '@nestjs/azure-storage/dist/azure-storage.service';
import {
  Controller,
  Body,
  Put,
  UseGuards,
  Get,
  UploadedFile,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorator';
import { user } from '@prisma/client';
import { ProfileDto } from './dto';
import { Patch, UseInterceptors } from '@nestjs/common/decorators';
import { AzureStorageFileInterceptor } from '@nestjs/azure-storage';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Put('updateProfile')
  async updateAddress(@GetUser() user: user, @Body() dto: ProfileDto) {
    return await this.profileService.updateProfile(user, dto);
  }

  @Get('getProfile')
  getProfile(@GetUser() user: user) {
    return this.profileService.getProfile(user);
  }

  @Patch('updateAva')
  @UseInterceptors(
    AzureStorageFileInterceptor('file', null, {
      containerName: 'img',
    }),
  )
  async updateAva(
    @GetUser() user: user,
    @UploadedFile() file: UploadedFileMetadata,
  ) {
    try {
      return await this.profileService.updateAva(user, file.storageUrl);
    } catch (error) {
      throw error;
    }
  }
}
