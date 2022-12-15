import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ImportDto {
  @ApiProperty()
  @IsNotEmpty()
  surcharge: number;
}
