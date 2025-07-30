import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from 'src/payments/entities/payment.entity';
import { User } from 'src/users/entities/user.entity';
import { Order } from './entities/order.entity';
import { CartItem } from 'src/carts/entities/cartItem.entity';
import { Product } from 'src/products/entities/product.entity';
import { OrderItem } from './entities/orderItem.entity';
import { Cart } from 'src/carts/entities/cart.entity';
import { AuthGuard } from 'src/auth/guard/HybridGuard';
import { AuthService } from 'src/auth/auth.service';
import { PaymentsService } from 'src/payments/payments.service';
import { CacheService } from 'src/cache/cache.service';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      User,
      Order,
      Cart,
      CartItem,
      Product,
      OrderItem,
    ]),
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    CacheService,
    RedisService,
    AuthGuard,
    AuthService,
    PaymentsService,
  ],
})
export class OrdersModule {}
