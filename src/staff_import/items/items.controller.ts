import { ItemsService } from './items.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Post, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { user } from '@prisma/client';
import { JwtGuard } from 'src/auth/guard';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@ApiTags('Import Items')
@Controller('items')
export class ItemsController {
  constructor(private itemsService: ItemsService) {}

  @Post('createImportForm')
  async createImportForm(@GetUser() user: user) {
    return this.itemsService.createImportForm(user)
  }
}
