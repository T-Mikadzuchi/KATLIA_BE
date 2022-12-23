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

  @Get('filterColorByGender')
  filterColorByGender(
    @Query('colorId') colorId: string,
    @Query('gender') gender: string,
  ) {
    const id = parseInt(colorId);
    gender = gender.toLowerCase();
    return this.filterService.filterColorByGender(id, gender);
  }

  @Get('filterColorByCategoryId')
  filterColorByCategoryId(
    @Query('colorId') colorId: string,
    @Query('categoryId') categoryId: string,
  ) {
    const color = parseInt(colorId);
    const cate = parseInt(categoryId);
    return this.filterService.filterColorByCategoryId(color, cate);
  }

  @Get('filterSizeByGender')
  filterSizeByGender(
    @Query('size') size: string,
    @Query('gender') gender: string,
  ) {
    gender = gender.toLowerCase();
    return this.filterService.filterSizeByGender(size, gender);
  }

  @Get('filterSizeByCategoryId')
  filterSizeByCategoryId(
    @Query('size') size: string,
    @Query('categoryId') categoryId: string,
  ) {
    const cate = parseInt(categoryId);
    return this.filterService.filterSizeByCategoryId(size, cate);
  }

  @Get('filterSizeColorByGender')
  filterSizeColorByGender(
    @Query('colorId') colorId: string,
    @Query('size') size: string,
    @Query('gender') gender: string,
  ) {
    const color = parseInt(colorId);
    gender = gender.toLowerCase();
    return this.filterService.filterSizeColorByGender(color, size, gender);
  }

  @Get('filterSizeColorByCategoryId')
  filterSizeColorByCategoryId(
    @Query('colorId') colorId: string,
    @Query('size') size: string,
    @Query('categoryId') categoryId: string,
  ) {
    const color = parseInt(colorId);
    const cate = parseInt(categoryId);
    return this.filterService.filterSizeColorByCategoryId(color, size, cate);
  }
}
