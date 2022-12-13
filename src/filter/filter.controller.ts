import { ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { FilterService } from './filter.service';

@ApiTags('Filter')
@Controller('filter')
export class FilterController {
  constructor(private filterService: FilterService) {}

  @Get('getAllColors')
  getAllColors() {
    return this.filterService.getAllColors();
  }

  @Get('getAllSizes')
  async getAllSizes() {
    return this.filterService.getAllSizes();
  }
}
