import { ApiProperty } from '@nestjs/swagger';

export class CartDto {
  @ApiProperty()
  productId: number;

  @ApiProperty()
  colorId: number;

  @ApiProperty()
  size: string;

  @ApiProperty()
  quantity: number;
}
