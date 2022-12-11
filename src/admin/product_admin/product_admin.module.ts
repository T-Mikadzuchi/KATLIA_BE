import { AdminService } from './../admin.service';
import { CategoryService } from './../../category/category.service';
import { ProductService } from './../../product/product.service';
import { Module } from '@nestjs/common';
import { ProductAdminController } from './product_admin.controller';
import { ProductAdminService } from './product_admin.service';

@Module({
  controllers: [ProductAdminController],
  providers: [
    ProductAdminService,
    ProductService,
    CategoryService,
    AdminService,
  ],
})
export class ProductAdminModule {}
