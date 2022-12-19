import { ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { Controller, Get, Param } from '@nestjs/common';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}
  @Get('getProductByGender/:gender')
  getProductByGender(@Param('gender') gender: string) {
    gender = gender.toLowerCase();
    return this.productService.getProductByGender(gender);
  }

  @Get('getProductByCategoryId/:categoryId')
  getProductByCategoryId(@Param('categoryId') categoryId: number) {
    categoryId = parseInt(categoryId.toString());
    return this.productService.getProductByCategoryId(categoryId);
  }

  @Get('getTop4/:gender')
  getTop4(@Param('gender') gender: string) {
    gender = gender.toLowerCase();
    return this.productService.getTop4(gender);
  }

  @Get('getProductDetail/:id')
  getProductDetail(@Param('id') id: number) {
    id = parseInt(id.toString());
    return this.productService.getProductDetail(id);
  }

  @Get('get4SimilarItems/:id')
  get4SimilarItems(@Param('id') id: number) {
    id = parseInt(id.toString());
    return this.productService.get4SimilarItems(id);
  }

  @Get('getSaleProductByGender/:gender')
  getSaleProductByGender(@Param('gender') gender: string) {
    return this.productService.getSaleProductByGender(gender);
  }

  @Get('getSaleProductByCategoryId/:categoryId')
  getSaleProductByCategoryId(@Param('categoryId') categoryId: string) {
    const id = parseInt(categoryId);
    return this.productService.getSaleProductByCategoryId(id);
  }

  @Get('getFeedbacksForProduct/:id')
  getFeedbacksForProduct(@Param('id') id: string) {
    const prodId = parseInt(id);
    return this.productService.getFeedbacksForProduct(prodId);
  }
}
