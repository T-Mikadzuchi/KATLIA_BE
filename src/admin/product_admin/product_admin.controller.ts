import { ProductDto } from './dto/product.dto';
import { ProductAdminService } from './product_admin.service';
import { JwtGuard } from './../../auth/guard/jwt.guard';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorator';
import { user } from '@prisma/client';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@ApiTags('Admin Product')
@Controller('product-admin')
export class ProductAdminController {
  constructor(private productAdminService: ProductAdminService) {}

  @Get('getAllProducts')
  getAllProducts() {
    return this.productAdminService.getAllProducts();
  }

  @Post('addProducts')
  addNewProduct(@GetUser() user: user, @Body() dto: ProductDto) {
    return this.productAdminService.addNewProduct(user, dto);
  }
}
