import { ProductService } from './../product/product.service';
import { CartService } from './../cart/cart.service';
import { OrderDto } from './dto/order.dto';
import { user } from '@prisma/client';
import { PrismaService } from './../prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class OrderService {
  constructor(
    private prismaService: PrismaService,
    private cartService: CartService,
    private productService: ProductService,
  ) {}

  async getItemsAndUpdateQuantity(user: user, cartId: string) {
    const cartItems = await this.prismaService.order_item.findMany({
      where: {
        orderId: cartId,
      },
    });

    const itemList: any[] = [];
    const products: any[] = [];
    let message = '';
    for (const cartItem of cartItems) {
      const item = await this.prismaService.product_detail.findFirst({
        where: {
          productId: cartItem.productId,
          colorId: cartItem.colorId,
          size: cartItem.size,
        },
      });
      if (cartItem.quantity > item.quantity) {
        if (item.quantity == 0) {
          throw new ForbiddenException(
            `Item ${item.productId} color ${item.colorId} size ${item.size} has been out of stock, pls back to your cart`,
          );
        } else {
          await this.prismaService.order_item.update({
            where: {
              id: cartItem.id,
            },
            data: {
              quantity: item.quantity,
            },
          });
          throw new ForbiddenException(
            `Item ${item.productId} color ${item.colorId} size ${item.size} has reached its maximum quantity, pls back to your cart`,
          );
        }
      } else {
        products.push(item);
        message = 'ok';
      }
      const product = await this.prismaService.product.findUnique({
        where: {
          productId: cartItem.productId,
        },
      });

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
        unit: product.price,
        unitSale: salePrice,
        quantity: cartItem.quantity,
        total: product.price * cartItem.quantity,
        totalSale: salePrice != null ? salePrice * cartItem.quantity : null,
      });
    }

    //update product quantity
    for (const product of products) {
      for (const item of cartItems) {
        if (item.productId == product.productId && item.colorId == product.colorId && item.size == product.size) {
          const updateQuantity = await this.prismaService.product_detail.update(
            {
              where: {
                id: product.id,
              },
              data: {
                quantity: product.quantity - item.quantity,
              },
            },
          );
          console.log('Update quantity');
          console.log(updateQuantity);
          break;
        }
      }
    }

    for (const item of itemList) {
      for (const cartItem of cartItems) {
        if (cartItem.id == item.id) {
          const updateCart = await this.prismaService.order_item.update({
            where: {
              id: item.id,
            },
            data: {
              currentPrice: item.unit,
              currentSalesPrice: item.unitSale,
            },
          });
          console.log('Update cart');
          console.log(updateCart);
        }
      }
    }
    return itemList;
  }

  async getOrder(user: user) {
    const cart = await this.cartService.findCart(user);
    if (!cart) throw new ForbiddenException('No cart');

    const cartItems = await this.getItemsAndUpdateQuantity(user, cart.id);
    if (cartItems.length < 1)
      throw new ForbiddenException("You can't order empty cart");
    let count = 0;
    let subtotal = 0;
    let afterSale = 0;
    for (const item of cartItems) {
      count += item.quantity;
      subtotal += item.total;
      afterSale += item.totalSale != null ? item.totalSale : 0;
    }
    const discount = afterSale == 0 ? 0 : subtotal - afterSale;
    const ship = this.cartService.setShippingFee(count);
    return {
      id: cart.id,
      cartItems,
      subtotal,
      discount,
      subtotalOnDiscount: subtotal - discount,
      ship,
      total: subtotal - discount + ship,
    };
  }

  async purchase(user: user, dto: OrderDto) {
    const startTime = performance.now();
    const order = await this.getOrder(user);
    const payment = await this.prismaService.payment.create({
      data: {
        method: dto.payment == 0 ? 'COD' : dto.payment == 1 ? 'CARD' : 'PAYPAL',
        status: dto.payment == 0 ? 0 : 1,
      },
    });
    const placed = await this.prismaService.order_detail.update({
      where: {
        id: order.id,
      },
      data: {
        receiverName: dto.receiverName,
        receiverPhone: dto.receiverPhone,
        address: dto.address,
        paymentId: payment.id,
        shippingFee: order.ship,
        total: order.total,
        note: dto.note,
        createdAt: new Date(),
        status: 'PLACED',
      },
    });
    const endTime = performance.now();

    console.log(`Call to doSomething took ${endTime - startTime} milliseconds`);
    return placed;
  }
}
