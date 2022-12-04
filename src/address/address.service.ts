import { Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { user } from '@prisma/client';
import { AddressDto } from './dto';

@Injectable()
export class AddressService {
    constructor(private prismaService: PrismaService) {}

    async findDetailAddress(user: user, addressId: string){
      const customer = await this.prismaService.customer.findUnique({
        where: {
          userId: user.id,
        },
      });
  
      const address = await this.prismaService.customer_address.findFirst({
        where: {
          customerId: customer.id,
          id: addressId,
        },
      });
      return address;
        
    }
    

    async findAddress(user: user){
        const customer = await this.prismaService.customer.findUnique({
            where: {
              userId: user.id,
            },
          });
      
          const address = await this.prismaService.customer_address.findMany({
            where: {
              customerId: customer.id,
            },
          });
          return address;
    }
   
    async getAllAddress(user: user){
        const address= this. findAddress(user);
        return address;
        
    }
    async updateAddress(user: user, addressId: string, dto: AddressDto){
        const detailAdressId= await (await this.findDetailAddress(user, addressId)).id;
        const customer = await this.prismaService.customer.findUnique({
          where: {
            userId: user.id,
          },
        });
        const findDefault= await this.prismaService.customer_address.findFirst({
          where:{
              customerId: customer.id,
              setAsDefault: true,
          }
        });
        if(!findDefault){
          const updated= await this.prismaService.customer_address.update({
            where:{
              id: detailAdressId,
            },
            data:{
             
              fullname: dto.fullname,
              phonenumber: dto.phonenumber,
              address: dto.address,
              province: dto.province,
              district: dto.district,
              ward: dto.ward,
              note: dto.note,
              setAsDefault: dto.setAsDefault,
            }
  
          });
        }
        else{
          const updated= await this.prismaService.customer_address.update({
            where:{
              id: detailAdressId,
            },
            data:{
             
              fullname: dto.fullname,
              phonenumber: dto.phonenumber,
              address: dto.address,
              province: dto.province,
              district: dto.district,
              ward: dto.ward,
              note: dto.note,
              setAsDefault: false,
            }
  
          });
        }
        

    }
    async deleteAddress(user: user, addressId: string){
      const detailAdressId= await (await this.findDetailAddress(user, addressId)).id;
      
      const deleteAddress= await this.prismaService.customer_address.delete({
        where:{
           id: addressId,
        }
      });
    }
    async addAddress(user: user, dto: AddressDto){
      const customer = await this.prismaService.customer.findUnique({
        where: {
          userId: user.id,
        },
      });
      const findDefault= await this.prismaService.customer_address.findFirst({
        where:{
            customerId: customer.id,
            setAsDefault: true,
        }
      });
      if(!findDefault){
        const insertAddress= await this.prismaService.customer_address.create({
        
          data:{
            customerId: customer.id,
            fullname: dto.fullname,
            phonenumber: dto.phonenumber,
            address: dto.address,
            province: dto.province,
            district: dto.district,
            ward: dto.ward,
            note: dto.note,
            setAsDefault: dto.setAsDefault,
  
          }
        });
      }
    else{
      const insertAddress= await this.prismaService.customer_address.create({
        
        data:{
          customerId: customer.id,
          fullname: dto.fullname,
          phonenumber: dto.phonenumber,
          address: dto.address,
          province: dto.province,
          district: dto.district,
          ward: dto.ward,
          note: dto.note,
          setAsDefault: false,

        }
      });
    }
      
    }
}
