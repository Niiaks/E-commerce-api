import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { ProductCategory } from 'src/categories/entities/productCategory.entity';
import { AuthService } from 'src/auth/auth.service';
import { AuthGuard } from 'src/auth/guard/HybridGuard';
import { User } from 'src/users/entities/user.entity';
import { CacheService } from 'src/cache/cache.service';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [
    CloudinaryModule,
    TypeOrmModule.forFeature([Product, ProductCategory, User]),
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    AuthService,
    CacheService,
    RedisService,
    AuthGuard,
  ],
})
export class ProductsModule {}
