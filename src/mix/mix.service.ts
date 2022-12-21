import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MixService {
  constructor(private prismaService: PrismaService) {}

  getRandomArbitrary(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  getRandomFromArray(choose: number[]) {
    return choose[this.getRandomArbitrary(0, choose.length)];
  }

  async get1(gender: string, colorId: number) {
    let choose: number[] = [];
    switch (gender) {
      case 'men':
        choose = [1, 4];
        break;
      case 'women':
        choose = [6, 9, 12];
        break;
      default:
        choose = [1, 4, 6, 9, 12];
        break;
    }
    while (choose.length > 0) {
      const cate = this.getRandomFromArray(choose);
    }
    return;
  }

  async mixAndMatch(gender: string, colorId: number) {
    if (colorId == 0) colorId = this.getRandomArbitrary(1, 35);
    return;
  }
}
