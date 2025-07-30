import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cartItem.entity';
import { User } from 'src/users/entities/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { AuthGuard } from 'src/auth/guard/HybridGuard';

import { Product } from 'src/products/entities/product.entity';

import { CacheService } from 'src/cache/cache.service';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem, User, Product])],
  controllers: [CartsController],
  providers: [CartsService, AuthService, AuthGuard, CacheService, RedisService],
})
export class CartsModule {}
