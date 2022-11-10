import { CartDto } from './dto/cart.dto';
import { Injectable } from '@nestjs/common';
import { user } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prismaService: PrismaService) {}

  async createCart(user: user) {
    console.log(user.id)
    
    return
  }
  async addItemToCart(user: user, dto: CartDto) {
    await this.createCart(user)
    return user
  }
}
