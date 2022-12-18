import {
  Controller,
  Body,
  Delete,
  Get,
  Put,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorator';
import { user } from '@prisma/client';
import { AddressDto } from './dto';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@ApiTags('Address')
@Controller('address')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @Get('getAllAddress')
  getAllAddress(@GetUser() user: user) {
    return this.addressService.getAllAddress(user);
  }
  @Put('updateAddress/:id')
  async updateAddress(
    @GetUser() user: user,
    @Param('id') addressId: string,
    @Body() dto: AddressDto,
  ) {
    return await this.addressService.updateAddress(user, addressId, dto);
  }
  @Delete('deleteAdress/:id')
  async deleteAdress(@GetUser() user: user, @Param('id') addressId: string) {
    return await this.addressService.deleteAddress(user, addressId);
  }
  @Post('addAddress')
  async addAddress(@GetUser() user: user, @Body() dto: AddressDto) {
    return await this.addressService.addAddress(user, dto);
  }
}
