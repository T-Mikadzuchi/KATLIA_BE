import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
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
  getAllSizes() {
    return this.filterService.getAllSizes();
  }

  @Get('searchProducts')
  searchProducts(@Query('search') search: string) {
    return this.filterService.searchProducts(search);
  }

  @Get('filterByColor')
  filterByColor(@Query('colorId') colorId: string) {
    const id = parseInt(colorId);
    return this.filterService.filterByColor(id);
  }

  @Get('filterBySize')
  filterBySize(@Query('size') size: string) {
    return this.filterService.filterBySize(size);
  }

  @Get('filterByColorAndSize')
  filterByColorAndSize(
    @Query('colorId') colorId: string,
    @Query('size') size: string,
  ) {
    const id = parseInt(colorId);
    return this.filterService.filterByColorAndSize(id, size);
  }
}
