import { AdminService } from './../admin.service';
import { DiscountDto } from './dto/discount.dto';
import { user } from '@prisma/client';
import { DiscountService } from './discount.service';
import {
  Body,
  Controller,
  Post,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('discount')
export class DiscountController {
  constructor(
    private discountService: DiscountService,
  ) {}
  @Post('addNewDiscount')
  addNewDiscount(@GetUser() user: user, @Body() dto: DiscountDto) {
    return this.discountService.addNewDiscount(user, dto);
  }
}
