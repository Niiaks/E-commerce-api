import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { CartsModule } from './carts/carts.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from './redis/redis.module';
import { CacheModule } from './cache/cache.module';
import { CacheService } from './cache/cache.service';
import { RedisService } from './redis/redis.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { entities } from './config/typeorm.config';
import { ThrottlerModule } from '@nestjs/throttler';
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ProductsModule,
    CategoriesModule,
    CartsModule,
    OrdersModule,
    CacheModule,
    PaymentsModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities,
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      global: true,
    }),

    AuthModule,
    CloudinaryModule,
    RedisModule,
    CacheModule,
  ],
  controllers: [AppController],
  providers: [AppService, CacheService, RedisService],
})
export class AppModule {}
