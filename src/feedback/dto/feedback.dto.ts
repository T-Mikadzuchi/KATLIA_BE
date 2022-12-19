import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FeedbackDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  hideUsername: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  rate: number;

  @ApiProperty()
  comment: string;
}
