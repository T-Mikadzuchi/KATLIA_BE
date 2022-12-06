import { CategoryService } from './../../category/category.service';
import { ProductService } from './../../product/product.service';
import { PrismaService } from './../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductAdminService {
  constructor(
    private prismaService: PrismaService,
    private productService: ProductService,
    private categoryService: CategoryService,
  ) {}

  async getAllProducts() {
    const categories = await this.categoryService.getAll();
    const result: any[] = [];
    for (const cate of categories) {
      const products = await this.productService.getProductByCategoryId(
        cate.categoryId,
      );
      result.push({
        cate,
        products,
      });
    }
    return result;
  }
}
