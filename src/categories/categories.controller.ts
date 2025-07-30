import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  HttpCode,
  Headers,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { AuthGuard } from 'src/auth/guard/HybridGuard';
import { RolesGuard } from 'src/auth/guard/roleGuard';
import { Role } from 'src/users/entities/user.entity';
import { CACHE_KEYS } from 'src/cache/cache.constants';
import { CACHE_PREFIXES } from 'src/cache/cache.constants';
import { CACHE_TTL } from 'src/cache/cache.constants';
import { CacheService } from 'src/cache/cache.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

const { IDEMPOTENCY, CATEGORY_BY_ID } = CACHE_KEYS;
const { CATEGORY } = CACHE_PREFIXES;
const { VERY_VERY_LONG } = CACHE_TTL;
const { ADMIN } = Role;

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly cloudinary: CloudinaryService,
    private readonly cacheService: CacheService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, new RolesGuard(ADMIN))
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Headers('x-idem-key') idempotencyKey: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    try {
      if (!file) {
        throw new Error('File not provided or invalid');
      }
      const uploadedImage = await this.cloudinary.uploadImage(file);
      await this.cacheService.invalidatePattern(`${CATEGORY}:*`);
      return this.cacheService.getOrSet(
        IDEMPOTENCY(idempotencyKey),
        async () => {
          await this.categoriesService.create({
            ...createCategoryDto,
            image_url: uploadedImage.secure_url,
          });
        },
        {
          ttl: VERY_VERY_LONG,
        },
      );
    } catch (error) {
      console.error('Error in categories create:', error);
      throw error;
    }
  }
  @Get()
  findAll() {
    return this.cacheService.getOrSet(
      CATEGORY,
      () => this.categoriesService.findAll(),
      {
        prefix: CATEGORY,
        ttl: VERY_VERY_LONG,
      },
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cacheService.getOrSet(
      CATEGORY_BY_ID(id),
      () => this.categoriesService.findOne(id),
      {
        prefix: CATEGORY,
        ttl: VERY_VERY_LONG,
      },
    );
  }

  @Patch(':id')
  @HttpCode(204)
  @UseGuards(AuthGuard, new RolesGuard(ADMIN))
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    this.categoriesService.update(id, updateCategoryDto);
    await this.cacheService.del(CATEGORY_BY_ID(id), {
      prefix: CATEGORY,
    });
    await this.cacheService.invalidatePattern(`${CATEGORY}`);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AuthGuard, new RolesGuard(Role.ADMIN))
  async remove(@Param('id') id: string) {
    this.categoriesService.remove(id);
    await this.cacheService.del(CATEGORY_BY_ID(id), {
      prefix: CATEGORY,
    });
  }
}
