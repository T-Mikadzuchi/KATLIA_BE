import { user } from '@prisma/client';
import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  constructor(private prismaService: PrismaService) {}

  async isAdmin(user: user) {
    return user.role == 'ADMIN';
  }
}
