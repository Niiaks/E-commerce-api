import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { CartItem } from 'src/carts/entities/cartItem.entity';
import { Cart } from 'src/carts/entities/cart.entity';
import { OrderItem } from './entities/orderItem.entity';
import { ConfigService } from '@nestjs/config';
import { Product } from 'src/products/entities/product.entity';
import { PaymentsService } from 'src/payments/payments.service';

const { PENDING } = OrderStatus;
@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    private dataSource: DataSource,
    private paymentService: PaymentsService,
  ) {}

  private generateOrderNumber() {
    const part1 = Math.floor(10000 + Math.random() * 10000);
    const part2 = Math.floor(10 + Math.random() * 90);
    return `${part1}-${part2}`;
  }
  async create(user: User, shippingFee: number = 30) {
    return await this.dataSource.transaction(async (entityManager) => {
      // Find user's cart with items
      const cart = await entityManager.findOne(Cart, {
        where: {
          user: { userId: user.userId },
        },
        relations: ['cartItems', 'cartItems.product'],
      });

      if (!cart || !cart.cartItems.length) {
        return [];
      }

      // Check if user already has a pending order
      let order = await entityManager.findOne(Order, {
        where: {
          user: { userId: user.userId },
          status: PENDING,
        },
        relations: ['orderItems', 'orderItems.product', 'user'],
      });

      if (order) {
        throw new BadRequestException('User already has a pending order');
      }

      // Validate inventory before creating order
      for (const cartItem of cart.cartItems) {
        const currentProduct = await entityManager.findOne(Product, {
          where: { productId: cartItem.product.productId },
        });
        if (!currentProduct) {
          throw new NotFoundException(
            `Product ${cartItem.product.name} not found`,
          );
        }
        if (currentProduct.quantity < cartItem.quantity) {
          throw new ConflictException(
            `Insufficient stock for ${cartItem.product.name}. Available: ${currentProduct.quantity}, Requested: ${cartItem.quantity}`,
          );
        }
      }

      // Create order items
      const orderItems = await Promise.all(
        cart.cartItems.map(async (cartItem) => {
          const orderItem = entityManager.create(OrderItem, {
            product: cartItem.product,
            quantity: cartItem.quantity,
            total_amount: cartItem.price,
          });
          return await entityManager.save(OrderItem, orderItem);
        }),
      );

      // Validate order items
      if (!orderItems.length) {
        throw new UnprocessableEntityException(
          'Invalid items found in the cart, unable to create',
        );
      }

      // Calculate totals
      const subtotal = orderItems.reduce(
        (total, item) => total + Number(item.total_amount),
        0,
      );
      const total_amount = subtotal + shippingFee;

      // Create the order
      order = entityManager.create(Order, {
        user,
        orderItems,
        total_amount: total_amount,
        status: PENDING,
        order_number: this.generateOrderNumber(),
      });

      order = await entityManager.save(Order, order);

      const foundOrder = await entityManager.findOne(Order, {
        where: { orderId: order.orderId },
        relations: ['orderItems', 'orderItems.product', 'user'],
      });
      if (!foundOrder) {
        throw new BadRequestException('order not found');
      }
      const payment = await this.paymentService.makePayment({
        orderId: foundOrder.orderId,
        userId: foundOrder.user.userId,
        email: foundOrder.user.email,
        amount: Math.round(foundOrder.total_amount * 100).toString(),
      });
      await Promise.all(
        order.orderItems.map(async (orderItem) => {
          const updateResult = await entityManager.update(
            Product,
            orderItem.product.productId,
            {
              quantity: () => `quantity - ${orderItem.quantity}`, // atomic update
            },
          );

          if (updateResult.affected === 0) {
            throw new BadRequestException(
              `Failed to update inventory for product ${orderItem.product.productId}`,
            );
          }
        }),
      );
      await entityManager.remove(CartItem, cart.cartItems);

      return {
        foundOrder,
        payment,
      };
    });
  }

  async findAll(userId: string) {
    const orders = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'product')
      .select([
        'order.orderId',
        'order.order_number',
        'order.total_amount',
        'order.date',
        'order.status',
        'orderItems.orderItemId',
        'product.name',
        'product.image_url',
      ])
      .where('order.user.userId = :userId', { userId })
      .getMany();

    return orders;
  }

  findOne(id: string, order_number?: string) {
    return this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'product')
      .select([
        'order.orderId',
        'order.order_number',
        'order.status',
        'order.total_amount',
        'order.date',
        'orderItems.orderItemId',
        'product.productId',
        'product.name',
        'product.price',
        'product.image_url',
      ])
      .where('order.orderId = :id', { id })
      .orWhere('order.order_number = :order_number', { order_number })
      .getOne();
  }

  update(id: string, updates: UpdateOrderDto) {
    return this.orderRepository.update(id, {
      status: updates.status,
    });
  }

  async remove(id: string) {
    return await this.orderRepository.delete(id);
  }
}
