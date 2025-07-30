import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Headers,
  HttpCode,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/guard/HybridGuard';
import { CacheService } from 'src/cache/cache.service';
import { CACHE_KEYS, CACHE_TTL } from 'src/cache/cache.constants';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { Order } from './entities/order.entity';

const { IDEMPOTENCY } = CACHE_KEYS;
const { VERY_LONG } = CACHE_TTL;
@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private cacheService: CacheService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Req() request: Request,
    @Headers('x-idem-key') idempotencyKey: string,
  ) {
    return this.cacheService.getOrSet(
      IDEMPOTENCY(idempotencyKey),
      () => {
        return this.ordersService.create(request.user?.userId as any);
      },
      {
        ttl: VERY_LONG,
      },
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Req() request: Request) {
    return this.ordersService.findAll(request.user?.userId as string);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return await this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
