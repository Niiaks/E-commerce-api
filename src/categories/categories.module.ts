import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { AuthService } from 'src/auth/auth.service';
import { AuthGuard } from 'src/auth/guard/HybridGuard';
import { User } from 'src/users/entities/user.entity';
import { CacheService } from 'src/cache/cache.service';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [CloudinaryModule, TypeOrmModule.forFeature([Category, User])],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    AuthService,
    AuthGuard,
    CacheService,
    RedisService,
  ],
})
export class CategoriesModule {}
