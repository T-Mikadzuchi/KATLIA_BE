import { CartService } from './cart.service';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorator';
import { user } from '@prisma/client';
import { CartDto } from './dto/cart.dto';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Post('addItemToCart')
  addItemToCart(@GetUser() user: user, @Body() dto: CartDto) {
    return this.cartService.addItemToCart(user, dto)
  }
}
