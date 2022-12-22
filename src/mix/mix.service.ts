import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MixService {
  constructor(private prismaService: PrismaService) {}

  getRandomArbitrary(min: number, max: number) {
    return Math.round(Math.random() * (max - min) + min);
  }

  getRandomFromArray(choose: number[]) {
    return choose[this.getRandomArbitrary(0, choose.length - 1)];
  }

  removeFromArray(value: number, array: number[]) {
    const index = array.indexOf(value);
    if (index > -1) {
      array.splice(index, 1);
    }
  }

  async findEasyMixColor(choose: number[], list: any[]) {
    let findAlternative = false;
    while (choose.length > 0) {
      const cate = this.getRandomFromArray(choose);
      console.log(cate)
      const getProduct = await this.prismaService.product.findMany({
        where: {
          categoryId: cate,
        },
      });
      for (const prod of getProduct) {
        const prodWithColor = await this.prismaService.image.findFirst({
          where: {
            OR: [
              {
                colorId: 5,
              },
              {
                colorId: 34,
              },
              {
                colorId: 4,
              },
            ],
            productId: prod.productId,
          },
          distinct: ['colorId', 'productId'],
        });
        if (prodWithColor) {
          findAlternative = true;
          list.push(prodWithColor);
        }
      }

      if (findAlternative) break;
      this.removeFromArray(cate, choose);
    }
  }

  async findRandom(choose: number[], list: any[], colorId: number) {
    let findRandom = false;
    while (choose.length > 0) {
      const cate = this.getRandomFromArray(choose);
      const getProduct = await this.prismaService.product.findMany({
        where: {
          categoryId: cate,
        },
      });
      for (const prod of getProduct) {
        const prodWithColor = await this.prismaService.image.findFirst({
          where: {
            OR: [
              {
                colorId: 5,
              },
              {
                colorId: 34,
              },
              {
                colorId: 4,
              },
              {
                colorId,
              },
            ],
            productId: prod.productId,
          },
          distinct: ['colorId', 'productId'],
        });
        if (prodWithColor) {
          findRandom = true;
          list.push(prodWithColor);
        }
      }

      if (findRandom) break;
      this.removeFromArray(cate, choose);
    }
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

    const temp: number[] = [];
    for (const num of choose) {
      temp.push(num);
    }

    const list: any[] = [];
    let find = false;
    while (choose.length > 0) {
      const cate = this.getRandomFromArray(choose);
      const getProduct = await this.prismaService.product.findMany({
        where: {
          categoryId: cate,
        },
      });
      for (const prod of getProduct) {
        const prodWithColor = await this.prismaService.image.findFirst({
          where: {
            colorId,
            productId: prod.productId,
          },
          distinct: ['colorId', 'productId'],
        });
        if (prodWithColor != null) {
          find = true;
          list.push(prodWithColor);
        }
      }

      if (find == true) break;
      this.removeFromArray(cate, choose);
    }

    if (!find) {
      choose = temp;
      await this.findEasyMixColor(choose, list);
    }

    const pick = list[this.getRandomArbitrary(0, list.length - 1)];
    const prod = await this.prismaService.product.findUnique({
      where: {
        productId: pick.productId,
      },
    });

    return {
      find,
      item: {
        url: pick.url,
        name: prod.name,
      },
      cate: prod.categoryId,
    };
  }

  async get2(gender: string, colorId: number, find1: boolean) {
    let choose: number[] = [];
    switch (gender) {
      case 'men':
        choose = [2];
        break;
      case 'women':
        choose = [7, 8];
        break;
      default:
        choose = [2, 7, 8, 3];
        break;
    }

    const temp: number[] = [];
    for (const num of choose) {
      temp.push(num);
    }

    const list: any[] = [];
    let find = false;

    if (find1) {
      find = true;
      await this.findRandom(choose, list, colorId);
    } else {
      while (choose.length > 0) {
        const cate = this.getRandomFromArray(choose);
        const getProduct = await this.prismaService.product.findMany({
          where: {
            categoryId: cate,
          },
        });
        for (const prod of getProduct) {
          const prodWithColor = await this.prismaService.image.findFirst({
            where: {
              colorId,
              productId: prod.productId,
            },
            distinct: ['colorId', 'productId'],
          });
          if (prodWithColor) {
            find = true;
            list.push(prodWithColor);
          }
        }

        if (find) break;
        this.removeFromArray(cate, choose);
      }

      if (!find) {
        choose = temp;
        await this.findEasyMixColor(choose, list);
      }
    }

    const pick = list[this.getRandomArbitrary(0, list.length - 1)];
    const prod = await this.prismaService.product.findUnique({
      where: {
        productId: pick.productId,
      },
    });

    return {
      find,
      item: {
        url: pick.url,
        name: prod.name,
      },
      cate: prod.categoryId,
    };
  }

  async get3(gender: string, colorId: number, find2: boolean, cate1: number) {
    let choose: number[] = [];
    switch (gender) {
      case 'men':
        choose = [3];
        break;
      default:
        if (cate1 == 12) choose = [9];
        else choose = [10, 11];
        break;
    }

    const temp: number[] = [];
    for (const num of choose) {
      temp.push(num);
    }

    const list: any[] = [];
    let find = false;

    if (find2) {
      find = true;
      await this.findRandom(choose, list, colorId);
    } else {
      while (choose.length > 0) {
        const cate = this.getRandomFromArray(choose);
        const getProduct = await this.prismaService.product.findMany({
          where: {
            categoryId: cate,
          },
        });
        for (const prod of getProduct) {
          const prodWithColor = await this.prismaService.image.findFirst({
            where: {
              colorId,
              productId: prod.productId,
            },
            distinct: ['colorId', 'productId'],
          });
          if (prodWithColor) {
            find = true;
            list.push(prodWithColor);
          }
        }

        if (find) break;
        this.removeFromArray(cate, choose);
      }

      if (!find) {
        choose = temp;
        await this.findEasyMixColor(choose, list);
      }
    }

    const pick = list[this.getRandomArbitrary(0, list.length - 1)];
    const prod = await this.prismaService.product.findUnique({
      where: {
        productId: pick.productId,
      },
    });

    return {
      find,
      item: {
        url: pick.url,
        name: prod.name,
      },
      cate: prod.categoryId,
    };
  }

  async get4(gender: string, colorId: number, find3: boolean) {
    let choose: number[] = [];
    switch (gender) {
      case 'men':
        choose = [5];
        break;
      case 'women':
        choose = [13];
        break;
      default:
        choose = [5, 13];
        break;
    }

    const temp: number[] = [];
    for (const num of choose) {
      temp.push(num);
    }

    const list: any[] = [];
    let find = false;

    if (find3) {
      find = true;
      await this.findRandom(choose, list, colorId);
    } else {
      while (choose.length > 0) {
        const cate = this.getRandomFromArray(choose);
        const getProduct = await this.prismaService.product.findMany({
          where: {
            categoryId: cate,
          },
        });
        for (const prod of getProduct) {
          const prodWithColor = await this.prismaService.image.findFirst({
            where: {
              colorId,
              productId: prod.productId,
            },
            distinct: ['colorId', 'productId'],
          });
          if (prodWithColor) {
            find = true;
            list.push(prodWithColor);
          }
        }

        if (find) break;
        this.removeFromArray(cate, choose);
      }

      if (!find) {
        choose = temp;
        await this.findEasyMixColor(choose, list);
      }
    }

    const pick = list[this.getRandomArbitrary(0, list.length - 1)];
    const prod = await this.prismaService.product.findUnique({
      where: {
        productId: pick.productId,
      },
    });

    return {
      find,
      item: {
        url: pick.url,
        name: prod.name,
      },
      cate: prod.categoryId,
    };
  }

  async mixAndMatch(gender: string, colorId: number) {
    if (colorId == 0) colorId = this.getRandomArbitrary(1, 35);
    const item1 = await this.get1(gender, colorId);
    const find1 = item1.find;
    const cate1 = item1.cate;

    const item2 = await this.get2(gender, colorId, find1);
    const find2 = item2.find;

    const item3 = await this.get3(gender, colorId, find2, cate1);
    const find3 = item3.find;

    const item4 = await this.get4(gender, colorId, find3);
    return {
      item1,
      item2,
      item3,
      item4,
    };
  }
}
