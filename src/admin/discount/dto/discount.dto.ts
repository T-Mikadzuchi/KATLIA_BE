import { ApiProperty } from '@nestjs/swagger';

export class DiscountDto {
  @ApiProperty()
  discountName: string;

  @ApiProperty()
  percent: number;

  @ApiProperty()
  startAt: Date;

  @ApiProperty()
  endAt: Date;
}
