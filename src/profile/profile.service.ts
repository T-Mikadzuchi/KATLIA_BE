import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { user } from '@prisma/client';
import { ProfileDto } from './dto';
import { domainToASCII } from 'url';
import * as argon from 'argon2';
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

  async changePassword(user: user, dto: ProfileDto) {
    const userr = await this.prismaService.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (await argon.verify(userr.password, dto.oldPass)) {
      if (dto.newPass.length >= 6) {
        if (dto.newPass === dto.confirmPass) {
          const hash = await argon.hash(dto.newPass);
          await this.prismaService.user.update({
            where: {
              id: user.id,
            },
            data: {
              password: hash,
            },
          });
        } else {
          throw new ForbiddenException('Confirm password incorrect!');
        }
      } else {
        throw new ForbiddenException(
          'Password must be more than 6 characters!',
        );
      }
    } else {
      throw new ForbiddenException('Old password incorrect');
    }
  }
}
