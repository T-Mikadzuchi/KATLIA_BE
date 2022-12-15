import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DiscountDto {
  @ApiProperty()
  @IsNotEmpty()
  discountName: string;

  @ApiProperty()
  @IsNotEmpty()
  percent: number;

  @ApiProperty()
  @IsNotEmpty()
  startAt: Date;

  @ApiProperty()
  @IsNotEmpty()
  endAt: Date;
}
