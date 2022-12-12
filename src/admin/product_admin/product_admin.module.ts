import { AdminService } from './../admin.service';
import { CategoryService } from './../../category/category.service';
import { ProductService } from './../../product/product.service';
import { Module } from '@nestjs/common';
import { ProductAdminController } from './product_admin.controller';
import { ProductAdminService } from './product_admin.service';
import { AzureStorageModule } from '@nestjs/azure-storage';

@Module({
  controllers: [ProductAdminController],
  providers: [
    ProductAdminService,
    ProductService,
    CategoryService,
    AdminService,
  ],
  imports: [
    AzureStorageModule.withConfig({
      sasKey: process.env['AZURE_STORAGE_SAS_KEY'],
      accountName: process.env['AZURE_STORAGE_ACCOUNT'],
      containerName: 'img',
    }),
  ],
})
export class ProductAdminModule {}
