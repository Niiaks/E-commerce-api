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
  Query,
  UseGuards,
  Headers,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { AuthGuard } from 'src/auth/guard/HybridGuard';
import { RolesGuard } from 'src/auth/guard/roleGuard';
import { Role } from 'src/users/entities/user.entity';
import { CacheService } from 'src/cache/cache.service';
import {
  CACHE_KEYS,
  CACHE_PREFIXES,
  CACHE_TTL,
} from 'src/cache/cache.constants';

const { PRODUCTS_ALL, PRODUCT_BY_ID, IDEMPOTENCY } = CACHE_KEYS;
const { MEDIUM, VERY_LONG, VERY_VERY_LONG } = CACHE_TTL;
const { PRODUCTS, PRODUCT } = CACHE_PREFIXES;
const { ADMIN } = Role;

@Controller('catalog')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinary: CloudinaryService,
    private readonly cacheService: CacheService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, new RolesGuard(Role.ADMIN))
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Headers('x-idem-key') idempotencyKey: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() createProductDto: CreateProductDto,
  ) {
    try {
      if (!file) {
        throw new Error('File not provided or invalid');
      }
      const uploadedImage = await this.cloudinary.uploadImage(file);
      // invalidate products cache
      await this.cacheService.invalidatePattern(`${PRODUCTS}:*`);
      return this.cacheService.getOrSet(
        IDEMPOTENCY(idempotencyKey),
        async () => {
          await this.productsService.create({
            ...createProductDto,
            image_url: uploadedImage.secure_url,
          });
        },
        {
          ttl: VERY_LONG,
        },
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Get()
  findAllOrSearch(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('q') q?: string,
    @Query('min-price') min_price?: number,
    @Query('max-price') max_price?: number,
  ) {
    if (q || min_price || max_price) {
      return this.cacheService.getOrSet(
        PRODUCTS_ALL,
        () =>
          this.productsService.search(page, limit, q!, min_price, max_price),
        {
          prefix: PRODUCTS,
          ttl: MEDIUM,
        },
      );
      // return this.productsService.search(page, limit, q!, min_price, max_price);
    }
    return this.cacheService.getOrSet(
      PRODUCTS_ALL,
      () => this.productsService.findAll(page, limit),
      {
        prefix: PRODUCTS,
        ttl: VERY_LONG,
      },
    );
    // return this.productsService.findAll(page, limit);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cacheService.getOrSet(
      PRODUCT_BY_ID(id),
      () => this.productsService.findOne(id),
      {
        prefix: PRODUCT,
        ttl: VERY_VERY_LONG,
      },
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard, new RolesGuard(ADMIN))
  @HttpCode(204)
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      const uploadedImage = this.cloudinary.uploadImage(file);
      updateProductDto.image_url = (await uploadedImage).secure_url;
    }
    const product = await this.productsService.update(id, updateProductDto);
    //invalidate specific product by id and products list cache
    await this.cacheService.del(PRODUCT_BY_ID(id), {
      prefix: PRODUCT,
    });
    await this.cacheService.invalidatePattern(`${PRODUCTS}:*`);
    return product;
  }

  @Delete(':id')
  @UseGuards(AuthGuard, new RolesGuard(ADMIN))
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    const result = this.productsService.remove(id);
    await this.cacheService.del(PRODUCT_BY_ID(id), {
      prefix: PRODUCT,
    });
    return result;
  }
}
