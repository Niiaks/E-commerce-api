import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { AuthGuard } from 'src/auth/guard/HybridGuard';
import { Request } from 'express';
import { User } from 'src/users/entities/user.entity';
import { CacheService } from 'src/cache/cache.service';
import { CACHE_KEYS } from 'src/cache/cache.constants';
import { CACHE_PREFIXES } from 'src/cache/cache.constants';
import { CACHE_TTL } from 'src/cache/cache.constants';
import { Cart } from './entities/cart.entity';

const { IDEMPOTENCY, CART_BY_USER, CART_BY_ID } = CACHE_KEYS;
const { CART } = CACHE_PREFIXES;
const { VERY_VERY_LONG } = CACHE_TTL;

@ApiTags('Carts')
@ApiBearerAuth()
@Controller('carts')
export class CartsController {
  constructor(
    private readonly cartsService: CartsService,
    private readonly cacheService: CacheService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() createCartDto: CreateCartDto,
    @Req() request: Request,
    @Headers('x-idem-key') idempotencyKey: string,
  ) {
    await this.cacheService.invalidatePattern(`${CART}:*`);
    return this.cacheService.getOrSet(
      IDEMPOTENCY(idempotencyKey),
      async () => {
        if (!request.user || !('userId' in request.user)) {
          throw new Error('Invalid user in request');
        }
        await this.cartsService.create(createCartDto, request.user as User);
      },
      {
        ttl: VERY_VERY_LONG,
      },
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Req() request: Request) {
    return this.cacheService.getOrSet(
      CART_BY_USER(request.user?.userId!),
      () => this.cartsService.findAll(request.user?.userId!),
      { ttl: VERY_VERY_LONG, prefix: CART },
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Req() request: Request, @Param('id') id: string) {
    return this.cacheService.getOrSet(
      CART_BY_ID(id),
      async () => {
        this.cartsService.findOne(id, request.user?.userId as string);
      },
      {
        ttl: VERY_VERY_LONG,
        prefix: CART,
      },
    );
  }

  @Delete()
  @HttpCode(204)
  @UseGuards(AuthGuard)
  async clearCart(@Req() request: Request) {
    await this.cartsService.clearCart(request.user?.userId as string);
    await this.cacheService.invalidatePattern(`${CART}:*`);
  }

  @Patch('my-cart/:id')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    await this.cartsService.update(id, updateCartDto);
    await this.cacheService.del(CART_BY_ID(id), { prefix: CART });
    await this.cacheService.invalidatePattern(`${CART}:*`);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string) {
    this.cartsService.remove(id);
    await this.cacheService.del(CART_BY_ID(id), {
      prefix: CART,
    });
  }
}
