import { Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { user } from '@prisma/client';
import { ProfileDto } from './dto';
@Injectable()
export class ProfileService {
  constructor(private prismaService: PrismaService) {}
  async getProfile(user: user) {
    const getProfile = await this.prismaService.user.findMany({
      where: {
        id: user.id,
      },
      select: {
        email: true,
        fullName: true,
        phoneNumber: true,
        gender: true,
        birthday: true,
        address: true,
        province: true,
        district: true,
        ward: true,
        note: true,
        ava: true,
      },
    });
    return getProfile;
  }

  async updateProfile(user: user, dto: ProfileDto) {
    const update = await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
        gender: dto.gender,
        birthday: dto.birthday,
        address: dto.address,
        province: dto.province,
        district: dto.district,
        ward: dto.ward,
        note: dto.note,
      },
    });
    return update;
  }

  async updateAva(user: user, file: string) {
    const up = await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        ava: file,
      },
    });
    return up.ava;
  }
}
