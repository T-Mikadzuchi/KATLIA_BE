import { ConfigService } from '@nestjs/config';
import { JwtGuard } from './../auth/guard/jwt.guard';
import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GetUser } from './../auth/decorator';
import { user } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AzureStorageFileInterceptor } from '@nestjs/azure-storage/dist/azure-storage-file.interceptor';
import { UploadedFileMetadata } from '@nestjs/azure-storage/dist/azure-storage.service';

@ApiTags('Test')
@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private config: ConfigService) {}
  @Get('me')
  getMe(@GetUser() user: user) {
    return user;
  }

  @Post('ava')
  @UseInterceptors(
    AzureStorageFileInterceptor('file', null, {
      containerName: 'img',
    }),
  )
  async upAvaTest(
    @GetUser() user: user,
    @UploadedFile() file: UploadedFileMetadata,
  ) {
    console.log(`Storage URL: ${file.storageUrl}`);
    return {
      storageURL: file.storageUrl,
    };
  }
}
