import { MixService } from './mix.service';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Mix & Match')
@Controller('mix')
export class MixController {
  constructor(private mixService: MixService) {}

  @Get('mixAndMatch')
  async mixAndMatch(
    @Query('gender') gender: string,
    @Query('colorId') id: string,
  ) {
    const colorId = parseInt(id);
    gender = gender.toLowerCase();
    return await this.mixService.mixAndMatch(gender, colorId);
  }
}
