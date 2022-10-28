import { ProductService } from './product.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}
  @Get('getProductByGender/:gender')
  getProductByGender(@Param('gender') gender: string) {
    gender = gender.toLowerCase();
    return this.productService.getProductByGender(gender);
  }

  @Get('getProductByCategoryId/:categoryId')
  getProductByCategoryId(@Param('categoryId') categoryId: any) {
    return this.productService.getProductByCategoryId(categoryId)
  }

  @Get('getTop4/:gender')
  getTop4(@Param('gender') gender: string) {
    gender = gender.toLowerCase();
    return this.productService.getTop4(gender);
  }
}
