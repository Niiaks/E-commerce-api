import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto) {
    return await this.categoryRepository.save(createCategoryDto);
  }

  async findAll() {
    const categories = await this.categoryRepository.find({});
    if (categories.length === 0) {
      return [];
    }
    return categories;
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: {
        categoryId: id,
      },
    });
    if (!category) throw new NotFoundException('no category found');
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const foundCategory = await this.categoryRepository.findOne({
      where: {
        categoryId: id,
      },
    });
    if (!foundCategory)
      throw new NotFoundException('no category found to update');
    await this.categoryRepository.update(id, {
      ...updateCategoryDto,
    });
  }

  async remove(id: string) {
    await this.categoryRepository.delete(id);
  }
}
