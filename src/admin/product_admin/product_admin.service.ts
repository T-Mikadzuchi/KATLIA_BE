import { AdminService } from './../admin.service';
import { ProductDto } from './dto/product.dto';
import { user } from '@prisma/client';
import { CategoryService } from './../../category/category.service';
import { ProductService } from './../../product/product.service';
import { PrismaService } from './../../prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class ProductAdminService {
  constructor(
    private prismaService: PrismaService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private adminService: AdminService,
  ) {}

  async getAllProducts() {
    const categories = await this.categoryService.getAll();
    const result: any[] = [];
    const idList: number[] = [];
    for (const cate of categories) {
      const products = await this.productService.getProductByCategoryId(
        cate.categoryId,
      );

      for (const product of products) {
        idList.push(product.id);
        result.push({
          id: product.id,
          name: product.name,
          colorNumber: product.colorNumber,
          price: product.price,
          sold: product.sold,
          salePrice: product.salePrice,
          image: product.image,
          categoryId: cate.categoryId,
          category: cate.category,
          gender: cate.gender,
        });
      }
    }
    result.push({
      nextNewProductId: Math.max(...idList) + 1,
    });
    return result;
  }

  async addNewProduct(user: user, dto: ProductDto) {
    if (!(await this.adminService.isAdmin(user)))
      throw new ForbiddenException('Permission denied');

    for (const color of dto.colorIdList) {
      const checkColor = await this.prismaService.color.findUnique({
        where: {
          colorId: color,
        },
      });
      if (!checkColor)
        throw new ForbiddenException(`Color ID ${color} doesn't exist`);
    }

    const product = await this.prismaService.product.create({
      data: {
        productId: dto.productId,
        price: dto.price,
        colorNumber: dto.colorIdList.length,
        description: dto.description,
        defaultPic: 'https://www.donbalon.com/images/venue_default.png',
        categoryId: dto.categoryId,
        name: dto.name,
      },
    });

    const details: any[] = [];
    for (const color of dto.colorIdList) {
      const sizeList: string[] = dto.sizeList.trim().split(',');
      for (const size of sizeList) {
        const detail = await this.prismaService.product_detail.create({
          data: {
            productId: dto.productId,
            colorId: color,
            size,
          },
        });
        details.push(detail);
      }
    }

    return {
      product,
      details,
    };
  }
}
