import { ApiProperty } from '@nestjs/swagger';

export class EditItemDto {
  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: number;
}
