import { Controller , Body, Delete, Get,Put, Param, Post, UseGuards, } from '@nestjs/common';
import { AddressService } from './address.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorator';
import { user } from '@prisma/client';
import { AddressDto } from './dto';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('address')
export class AddressController {
    constructor(private addressService: AddressService){}

    @Get('getAllAddress')
    getCart(@GetUser() user: user) {
      return this.addressService.getAllAddress(user);
    }
    @Put('updateAddress/:id')
    updateAddress(@GetUser() user: user, @Param('id') addressId: string, @Body() dto:AddressDto){
      return this.addressService.updateAddress(user, addressId,dto);
    }
    @Delete('deleteAdress/:id')
    deleteAdress(@GetUser() user: user, @Param('id') addressId: string){
      return this.addressService.deleteAddress(user, addressId);
    }
    @Post('addAddress')
    addAddress(@GetUser() user: user, @Body() dto:AddressDto){
      return this.addressService.addAddress(user, dto);
    }
}
