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
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorator';
import { user } from '@prisma/client';
import {
  AzureStorageFileInterceptor,
  UploadedFileMetadata,
} from '@nestjs/azure-storage';
import { Delete, Param, Patch, Query } from '@nestjs/common/decorators';
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

  // @Get('getUndeletedProducts')
  // getUndeletedProducts() {
  //   return this.productAdminService.getUndeletedProducts();
  // }

  @Post('addProducts')
  async addNewProduct(@GetUser() user: user, @Body() dto: ProductDto) {
    dto.sizeList = dto.sizeList.toUpperCase();
    return await this.productAdminService.addNewProduct(user, dto);
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
      return await this.productAdminService.addAnImageForProduct(
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
    @Param('id') id: string,
  ) {
    try {
      const prodId = parseInt(id);
      return await this.productAdminService.setDefaultPicForProduct(
        user,
        prodId,
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
    return await this.productAdminService.editProductInfo(user, prodId, dto);
  }

  @ApiQuery({ name: 'productId', type: 'string' })
  @ApiQuery({ name: 'colorId', type: 'string' })
  @Delete('deleteProductImageByColor')
  async deleteProductImageByColor(
    @GetUser() user: user,
    @Query('productId') productId: string,
    @Query('colorId') colorId: string,
  ) {
    const prod = parseInt(productId);
    const color = parseInt(colorId);
    return await this.productAdminService.deleteProductImageByColor(
      user,
      prod,
      color,
    );
  }

  @ApiParam({
    description: 'Nhập productId',
    name: 'id',
  })
  @Delete('deleteAllImageOfProduct/:id')
  async deleteAllImageOfProduct(
    @GetUser() user: user,
    @Param('id') productId: string,
  ) {
    const id = parseInt(productId);
    return await this.productAdminService.deleteAllImageOfProduct(user, id);
  }

  @ApiParam({
    description: 'Là id của hình ảnh, xem ở phần getProductDetail',
    name: 'id',
  })
  @Delete('deleteAnImage/:id')
  async deleteAnImage(@GetUser() user: user, @Param('id') id: string) {
    return await this.productAdminService.deleteAnImage(user, id);
  }

  @ApiBody({
    schema: {
      properties: {
        idList: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
    },
  })
  @Delete('deleteSomeImages')
  async deleteSomeImages(@GetUser() user: user, @Body() dto: any) {
    return await this.productAdminService.deleteSomeImages(user, dto);
  }

  @Delete('deleteProduct/:id')
  async deleteProduct(@GetUser() user: user, @Param('id') id: string) {
    const prodId = parseInt(id);
    return await this.productAdminService.deleteProduct(user, prodId);
  }
}
