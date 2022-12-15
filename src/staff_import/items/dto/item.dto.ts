import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ItemDto {
  @ApiProperty()
  @IsNotEmpty()
  productId: number;

  @ApiProperty()
  @IsNotEmpty()
  colorId: number;

  @ApiProperty()
  @IsNotEmpty()
  size: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  @IsNotEmpty()
  unitPrice: number;
}
