import { ProductAdminService } from './product_admin.service';
import { JwtGuard } from './../../auth/guard/jwt.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

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
}
