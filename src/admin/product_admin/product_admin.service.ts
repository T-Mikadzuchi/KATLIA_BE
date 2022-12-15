import { EditProductDto } from './dto/edit-product.dto';
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
      const products = await this.productService.includeDeletedByCategoryId(
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
          isDeleted: product.isDeleted,
        });
      }
    }
    result.push({
      nextNewProductId: Math.max(...idList) + 1,
    });
    return result;
  }

  async getUndeletedProducts() {
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

  async addAnImageForProduct(
    user: user,
    file: string,
    productId: number,
    colorId: number,
  ) {
    if (!(await this.adminService.isAdmin(user)))
      throw new ForbiddenException('Permission denied');

    const checkProdColor = await this.prismaService.product_detail.findFirst({
      where: {
        productId,
        colorId,
      },
    });
    if (!checkProdColor)
      throw new ForbiddenException(
        `Product ID ${productId} doesn't have color ID ${colorId}`,
      );
    const up = await this.prismaService.image.create({
      data: {
        productId: productId,
        colorId: colorId,
        url: file,
      },
    });
    return up;
  }

  async setDefaultPicForProduct(user: user, id: number, file: string) {
    if (!(await this.adminService.isAdmin(user)))
      throw new ForbiddenException('Permission denied');

    const findProd = await this.prismaService.product.findUnique({
      where: {
        productId: id,
      },
    });
    if (!findProd) throw new ForbiddenException('Product not found');

    const up = await this.prismaService.product.update({
      where: {
        id: findProd.id,
      },
      data: {
        defaultPic: file,
      },
    });
    return up;
  }

  async editProductInfo(user: user, id: number, dto: EditProductDto) {
    try {
      if (!(await this.adminService.isAdmin(user)))
        throw new ForbiddenException('Permission denied');

      const findProd = await this.prismaService.product.findUnique({
        where: {
          productId: id,
        },
      });
      if (!findProd) throw new ForbiddenException('Product not found');

      const up = await this.prismaService.product.update({
        where: {
          productId: id,
        },
        data: {
          name: dto.name,
          description: dto.description,
          price: dto.price,
        },
      });
      return up;
    } catch (error) {
      throw error;
    }
  }

  async deleteProductImageByColor(
    user: user,
    productId: number,
    colorId: number,
  ) {
    if (!(await this.adminService.isAdmin(user)))
      throw new ForbiddenException('Permission denied');

    await this.prismaService.image.deleteMany({
      where: {
        productId,
        colorId,
      },
    });
    return `Images from product ID ${productId}, color ID ${colorId} have been deleted`;
  }

  async deleteAllImageOfProduct(user: user, id: number) {
    if (!(await this.adminService.isAdmin(user)))
      throw new ForbiddenException('Permission denied');

    await this.prismaService.image.deleteMany({
      where: {
        productId: id,
      },
    });
    return `Images from product ID ${id} have been deleted`;
  }

  async deleteAnImage(user: user, id: string) {
    if (!(await this.adminService.isAdmin(user)))
      throw new ForbiddenException('Permission denied');

    await this.prismaService.image.delete({
      where: {
        id,
      },
    });
    return `Image ID ${id} has been deleted`;
  }
  async deleteSomeImages(user: user, dto: any) {
    if (!(await this.adminService.isAdmin(user)))
      throw new ForbiddenException('Permission denied');
    console.log(dto.idList);

    for (const id of dto.idList) {
      await this.prismaService.image.delete({
        where: {
          id,
        },
      });
    }
    return 'Selected images have been deleted';
  }

  async deleteProduct(user: user, productId: number) {
    if (!(await this.adminService.isAdmin(user)))
      throw new ForbiddenException('Permission denied');

    const findProd = await this.prismaService.product.findUnique({
      where: {
        productId,
      },
    });
    if (!findProd) throw new ForbiddenException('Product not found');

    await this.prismaService.product.update({
      where: {
        productId,
      },
      data: {
        isDeleted: 1,
      },
    });
    return 'Product deleted';
  }
}
