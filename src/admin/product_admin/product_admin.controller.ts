import { ProductDto } from './dto/product.dto';
import { ProductAdminService } from './product_admin.service';
import { JwtGuard } from './../../auth/guard/jwt.guard';
import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorator';
import { user } from '@prisma/client';
import {
  AzureStorageFileInterceptor,
  UploadedFileMetadata,
} from '@nestjs/azure-storage';
import { Param, Patch, Query } from '@nestjs/common/decorators';
import { EditProductDto } from './dto/edit-product.dto';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@ApiTags('Admin Product')
@Controller('product-admin')
export class ProductAdminController {
  constructor(private productAdminService: ProductAdminService) {}

  @Get('getAllProducts')
  getAllProducts() {
    return this.productAdminService.getAllProducts();
  }

  @Post('addProducts')
  addNewProduct(@GetUser() user: user, @Body() dto: ProductDto) {
    return this.productAdminService.addNewProduct(user, dto);
  }

  @ApiQuery({ name: 'productId', type: 'string' })
  @ApiQuery({ name: 'colorId', type: 'string' })
  @Post('addAnImageForProduct')
  @UseInterceptors(
    AzureStorageFileInterceptor('file', null, {
      containerName: 'img',
    }),
  )
  async addAnImageForProduct(
    @GetUser() user: user,
    @UploadedFile() file: UploadedFileMetadata,
    @Query('productId') productId: string,
    @Query('colorId') colorId: string,
  ) {
    try {
      const prod = parseInt(productId);
      const color = parseInt(colorId);
      return this.productAdminService.addAnImageForProduct(
        user,
        file.storageUrl,
        prod,
        color,
      );
    } catch (error) {
      throw error;
    }
  }

  @Patch('setDefaultPicForProduct/:id')
  @UseInterceptors(
    AzureStorageFileInterceptor('file', null, {
      containerName: 'img',
    }),
  )
  async setDefaultPicForProduct(
    @GetUser() user: user,
    @UploadedFile() file: UploadedFileMetadata,
    @Param('id') id: string,
  ) {
    try {
      const prodId = parseInt(id);
      return this.productAdminService.setDefaultPicForProduct(
        user,
        prodId,
        file.storageUrl,
      );
    } catch (error) {
      throw error;
    }
  }

  @Patch('editProductInfo/:id')
  async editProductInfo(
    @GetUser() user: user,
    @Param('id') id: string,
    @Body() dto: EditProductDto,
  ) {
    const prodId = parseInt(id);
    return this.productAdminService.editProductInfo(user, prodId, dto);
  }
}
