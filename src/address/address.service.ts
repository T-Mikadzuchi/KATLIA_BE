import { ForbiddenException, Injectable } from '@nestjs/common';
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
    

    async getAllAddress(user: user){
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
        if(dto.setAsDefault==true && findDefault)
        {
          await this.prismaService.customer_address.update({
            where:{
              id: findDefault.id,
            }, data:{
              setAsDefault:false,
            }
          });
        }
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
        return updated;
        
              

    }
    async deleteAddress(user: user, addressId: string){
      const detailAdressId= await (await this.findDetailAddress(user, addressId)).id;
      
      const deleteAddress= await this.prismaService.customer_address.delete({
        where:{
           id: addressId,
        }
      });
      return deleteAddress;
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
      
      if(findDefault && dto.setAsDefault==true)
      {
        await this.prismaService.customer_address.update({
          where:{
            id: findDefault.id,
          }, data:{
            setAsDefault:false,
          }
        });
      }

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
        return insertAddress;
      
  }
}
