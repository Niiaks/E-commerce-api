import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

import { AuthGuard } from './guard/HybridGuard';
import { AuthController } from './auth.controller';
import { RedisService } from 'src/redis/redis.service';
import { CacheService } from 'src/cache/cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [AuthService, RedisService, CacheService, AuthGuard],
  controllers: [AuthController],
})
export class AuthModule {}
