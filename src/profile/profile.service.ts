import { Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { user } from '@prisma/client';
import { ProfileDto } from './dto';
@Injectable()
export class ProfileService {
    constructor(private prismaService: PrismaService){}

    async updateProfile(user: user, dto: ProfileDto){
        const update= await this.prismaService.user.update({
            where:{
                id: user.id,
              },
            data:{
                gender: dto.gender,
                fullName: dto.fullName,
                phoneNumber: dto.phoneNumber,
                birthday: dto.birthday,
                imageUrl: dto.imageUrl,
                address: dto.address,
                province: dto.province,
                district: dto.district,
                ward: dto.ward,
                note: dto.ward,
            }
        })
    }
}
