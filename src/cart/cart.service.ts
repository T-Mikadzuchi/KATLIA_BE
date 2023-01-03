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
        status: 0,
      },
    });

    if (!checkCart) {
      const cart = await this.prismaService.order_detail.create({
        data: {
          customerId: customer.id,
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
        productId: dto.productId,
        size: dto.size,
        colorId: dto.colorId,
        quantity: dto.quantity,
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
        status: 0,
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
    let message = '';
    for (const cartItem of cartItems) {
      const item = await this.prismaService.product_detail.findFirst({
        where: {
          productId: cartItem.productId,
          colorId: cartItem.colorId,
          size: cartItem.size,
        },
      });

      const product = await this.prismaService.product.findUnique({
        where: {
          productId: cartItem.productId,
        },
      });

      if (product.isDeleted != 0) {
        await this.deleteCartItem(user, cartItem.id);
        itemList.push({
          message: `Item ${item.productId} has been deleted`,
        });
        continue;
      }

      if (cartItem.quantity > item.quantity) {
        if (item.quantity == 0) {
          await this.deleteCartItem(user, cartItem.id);
          itemList.push({
            message: `Item ${item.productId} color ${item.colorId} size ${item.size} has been out of stock`,
          });
          continue;
        } else {
          await this.prismaService.order_item.update({
            where: {
              id: cartItem.id,
            },
            data: {
              quantity: item.quantity,
            },
          });
          message = `Item ${item.productId} color ${item.colorId} size ${item.size} has reached its maximum quantity`;
        }
      } else message = 'ok';

      const salePrice = await this.productService.setSalePrice(product);

      const color = await this.prismaService.color.findUnique({
        where: {
          colorId: cartItem.colorId,
        },
      });

      itemList.push({
        id: cartItem.id,
        message,
        productId: cartItem.productId,
        image: product.defaultPic,
        name: product.name + ' - ' + color.color + ' - ' + cartItem.size,
        unit: this.productService.formatFloat(product.price),
        unitSale: salePrice,
        quantity: cartItem.quantity,
        total: this.productService.formatFloat(
          product.price * cartItem.quantity,
        ),
        totalSale:
          salePrice != null && salePrice != 0
            ? salePrice * cartItem.quantity
            : null,
        instock: item.quantity,
      });
    }
    return itemList;
  }

  setShippingFee(count: number) {
    let extra: number;
    switch (Math.round(count / 4)) {
      case 0:
      case 1:
      case 2:
      case 3:
        extra = 0;
        break;
      default:
        extra = (Math.floor(count / 2) - 6) / 10;
        break;
    }
    const ship: number = 1 + extra;
    return ship;
  }

  async getCart(user: user) {
    let cart = await this.findCart(user);
    if (!cart) cart = await this.createCart(user);

    const cartItems = await this.getCartItems(user, cart.id);
    if (cartItems.length < 1)
      return {
        message: 'No item in cart',
      };

    let count = 0;
    let subtotal = 0;
    let afterSale = 0;
    for (const item of cartItems) {
      count += item.quantity;
      subtotal += item.total;
      afterSale += item.totalSale != null ? item.totalSale : item.total;
    }
    const discount = afterSale == 0 ? 0 : subtotal - afterSale;
    const ship = this.setShippingFee(count);
    return {
      cartItems,
      subtotal: this.productService.formatFloat(subtotal),
      discount: this.productService.formatFloat(discount),
      subtotalOnDiscount: this.productService.formatFloat(subtotal - discount),
      ship,
      total: this.productService.formatFloat(subtotal - discount + ship),
      count,
    };
  }

  async cartValidation(user: user, id: string) {
    try {
      const cart = await this.findCart(user);
      if (!cart) throw new ForbiddenException('wtf');

      const cartItem = await this.prismaService.order_item.findUnique({
        where: {
          id: id,
        },
      });
      if (!cartItem) throw new ForbiddenException("Cart item doesn't exist");
      if (cartItem.orderId != cart.id)
        throw new ForbiddenException('Not your cart item');
    } catch (error) {
      throw error;
    }
  }

  async deleteCartItem(user: user, id: string) {
    await this.cartValidation(user, id);
    await this.prismaService.order_item.delete({
      where: {
        id: id,
      },
    });
    return 'Item deleted';
  }

  async updateCartItem(user: user, id: string, number: number) {
    await this.cartValidation(user, id);

    if (number <= 0) throw new ForbiddenException("WTF quantity can't <=0");

    const cartItem = await this.prismaService.order_item.findUnique({
      where: {
        id,
      },
    });

    const productDetail = await this.prismaService.product_detail.findFirst({
      where: {
        colorId: cartItem.colorId,
        productId: cartItem.productId,
        size: cartItem.size,
      },
      select: {
        quantity: true,
      },
    });
    if (number > productDetail.quantity)
      throw new ForbiddenException('Product not available in quantity');

    const updated = await this.prismaService.order_item.update({
      where: {
        id,
      },
      data: {
        quantity: number,
      },
    });
    return updated;
  }
}
