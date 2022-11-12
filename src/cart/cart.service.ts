import { ProductService } from './../product/product.service';
import { CartDto } from './dto/cart.dto';
import { Injectable, ForbiddenException } from '@nestjs/common';
import { user } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ppid } from 'process';

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
    return checkCart;
  }

  async isItemInCart(cartId: string, dto: CartDto) {
    const item = await this.prismaService.order_item.findFirst({
      where: {
        orderId: cartId,
        productId: dto.productId,
        colorId: dto.colorId,
        size: dto.size,
      },
    });
    return item;
  }

  async addItemToCart(user: user, dto: CartDto) {
    if (dto.quantity <= 0)
      throw new ForbiddenException("WTF quantity can't <=0");
    const cart = await this.createCart(user);
    const existed = await this.isItemInCart(cart.id, dto);
    if (existed) {
      const newQuantity = existed.quantity + dto.quantity;
      const existedItem = await this.prismaService.order_item.update({
        where: {
          id: existed.id,
        },
        data: {
          quantity: newQuantity,
        },
      });
      return existedItem;
    }
    // const product = await this.prismaService.product.findUnique({
    //   where: {
    //     productId: dto.productId,
    //   },
    // });

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

    const cartItem = await this.prismaService.order_item.create({
      data: {
        orderId: cart.id,
        currentPrice: -1,
        productId: dto.productId,
        size: dto.size,
        colorId: dto.colorId,
        quantity: dto.quantity,
        currentSalesPrice: -1,
      },
    });
    return cartItem;
  }

  async findCart(user: user) {
    const customer = await this.prismaService.customer.findUnique({
      where: {
        userId: user.id,
      },
    });

    const cart = await this.prismaService.order_detail.findFirst({
      where: {
        customerId: customer.id,
        status: 'CART',
      },
    });
    return cart;
  }

  async getCartItems(user: user, cartId: string) {
    const cartItems = await this.prismaService.order_item.findMany({
      where: {
        orderId: cartId,
      },
    });

    const itemList: any[] = [];
    for (const item of cartItems) {
      const product = await this.prismaService.product.findUnique({
        where: {
          productId: item.productId,
        },
      });

      const image = await this.prismaService.image.findFirst({
        where: {
          productId: product.productId,
        },
      });

      let url = null;
      if (!image) return null;
      if (image.url.startsWith('//')) url = 'https:' + image.url;

      const salePrice = await this.productService.setSalePrice(product);

      const color = await this.prismaService.color.findUnique({
        where: {
          colorId: item.colorId,
        },
      });

      itemList.push({
        id: item.productId,
        image: url,
        name: product.name + ' - ' + color.color + ' - ' + item.size,
        unit: product.price,
        unitSale: salePrice,
        quantiy: item.quantity,
        total: product.price * item.quantity,
        totalSale: salePrice != null ? salePrice * item.quantity : null,
      });
    }
    return itemList;
  }

  async getCart(user: user) {
    const cart = await this.findCart(user);
    if (!cart) throw new ForbiddenException('No cart');

    const cartItems = this.getCartItems(user, cart.id);
    return cartItems;
  }
}
