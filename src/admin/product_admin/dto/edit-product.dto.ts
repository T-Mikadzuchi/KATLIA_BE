import { ApiProperty } from '@nestjs/swagger';

export class EditProductDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  price: number;
}
