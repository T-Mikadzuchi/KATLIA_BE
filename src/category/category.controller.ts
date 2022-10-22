import { CategoryService } from './category.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get('getCategoryByGender/:gender')
  getCategoryByGender(@Param('gender') gender: string) {
    gender = gender.toLowerCase();
    return this.categoryService.getCategoryByGender(gender);
  }
}
