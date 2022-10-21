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
}
