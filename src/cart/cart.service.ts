import { ProductService } from './../product/product.service';
import { CartDto } from './dto/cart.dto';
import { Injectable, ForbiddenException } from '@nestjs/common';
import { user } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(
    private prismaService: PrismaService,
    private productService: ProductService,
  ) {}

  async createCart(user: user) {
    const customer = await this.prismaService.customer.findUnique({
      where: {
        userId: user.id,
      },
    });

    const checkCart = await this.prismaService.order_detail.findFirst({
      where: {
        customerId: customer.id,
        status: 'CART',
      },
    });

    if (!checkCart) {
      const cart = await this.prismaService.order_detail.create({
        data: {
          customerId: customer.id,
          status: 'CART',
          staffId: '',
          voucherId: '',
          shippingFee: 0,
          paymentId: '',
          createdAt: new Date(),
          completedAt: new Date(),
          address: '',
          ward: '',
          district: '',
          city: '',
          receiverName: '',
          receiverPhone: '',
          note: '',
        },
      });
      return cart;
    } 
    return checkCart
  }
  async addItemToCart(user: user, dto: CartDto) {
    if (dto.quantity <= 0) throw new ForbiddenException("WTF quantity can't <=0")
    const cart = await this.createCart(user);
    const product = await this.prismaService.product.findUnique({
      where: {
        productId: dto.productId,
      },
    });

    const checkProduct = await this.prismaService.product_detail.findFirst({
      where: {
        productId: dto.productId,
        colorId: dto.colorId,
        size: dto.size,
        quantity: {
          gte: dto.quantity,
        },
      },
    });
    if (!checkProduct)
      throw new ForbiddenException(
        'The product is not available in color, size, or quantity',
      );

    const salePrice = await this.productService.setSalePrice(product);
    const cartItem = await this.prismaService.order_item.create({
      data: {
        orderId: cart.id,
        currentPrice: product.price,
        productId: dto.productId,
        size: dto.size,
        colorId: dto.colorId,
        quantity: dto.quantity,
        currentSalesPrice: salePrice,
      },
    });
    return cartItem;
  }
}
