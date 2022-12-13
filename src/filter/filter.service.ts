import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FilterService {
  constructor(private prismaService: PrismaService) {}
  getAllColors() {
    return this.prismaService.color.findMany();
  }

  async getAllSizes() {
    return this.prismaService.product_detail.findMany({
      distinct: ['size'],
      select: {
        size: true
      }
    }); 
  }
}
