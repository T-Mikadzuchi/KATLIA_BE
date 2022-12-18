import { StaffImportService } from './../staff_import.service';
import { EditItemDto } from './dto/edit-item.dto';
import { ItemDto } from './dto/item.dto';
import { ItemsService } from './items.service';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { user } from '@prisma/client';
import { JwtGuard } from 'src/auth/guard';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@ApiTags('Import Items')
@Controller('items')
export class ItemsController {
  constructor(
    private itemsService: ItemsService,
    private staffImportService: StaffImportService,
  ) {}

  @Get('getImportFormInfo')
  async createImportForm(@GetUser() user: user) {
    return await this.staffImportService.getImportForm(user);
  }

  @ApiBody({
    schema: {
      type: 'array',
      items: {
        properties: {
          productId: {
            type: 'number',
          },
          colorId: {
            type: 'number',
          },
          size: {
            type: 'string',
          },
          quantity: {
            type: 'number',
          },
          unitPrice: {
            type: 'number',
          },
        },
      },
    },
  })
  @Post('addItemsIntoForm')
  async addItemsIntoForm(@GetUser() user: user, @Body() dto: Array<ItemDto>) {
    return await this.itemsService.addItemsIntoForm(user, dto);
  }

  @Get('getProductSizeForImport/:id')
  async getProductSizeForImport(
    @GetUser() user: user,
    @Param('id') id: string,
  ) {
    const productId = parseInt(id);
    return this.itemsService.getProductSizeForImport(user, productId);
  }

  @Get('getProductColorForImport/:id')
  async getProductColorForImport(
    @GetUser() user: user,
    @Param('id') id: string,
  ) {
    const productId = parseInt(id);
    return this.itemsService.getProductColorForImport(user, productId);
  }

  @Get('getItemsInExistingForm')
  async getItemsInExistingForm(@GetUser() user: user) {
    return this.itemsService.getItemsInExistingForm(user);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Là id của cái form item, ko phải product',
  })
  @Delete('deleteAnItem/:id')
  async deleteAnItem(@GetUser() user: user, @Param('id') id: string) {
    return await this.itemsService.deleteAnItem(user, id);
  }

  @Delete('deleteAllItems')
  async deleteAllItems(@GetUser() user: user) {
    return await this.itemsService.deleteAllItems(user);
  }

  @Patch('editAnItem/:id')
  async editAnItem(
    @GetUser() user: user,
    @Param('id') id: string,
    @Body() dto: EditItemDto,
  ) {
    return await this.itemsService.editAnItem(user, id, dto);
  }

  @Get('getItemDetailForUpdate/:id')
  async getItemDetailForUpdate(@GetUser() user: user, @Param('id') id: string) {
    return this.itemsService.getItemDetailForUpdate(user, id);
  }
}
