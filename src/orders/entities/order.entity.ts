import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderItem } from './orderItem.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { DbEntity } from 'src/interfaces/Db-interface';

export enum OrderStatus {
  DELIVERED = 'delivered',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
  PLACED = 'placed',
  SHIPPED = 'shipped',
}

@Entity()
export class Order extends DbEntity {
  @ApiProperty({
    description: 'The unique identifier of the order',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @PrimaryGeneratedColumn('uuid')
  orderId: string;

  @ApiProperty({
    description: 'The date when the order was created',
    example: '2025-07-28',
    type: Date,
  })
  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  date: Date;

  @ApiProperty({
    description: 'The current status of the order',
    enum: OrderStatus,
    example: OrderStatus.PENDING,
    default: OrderStatus.PENDING,
  })
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @ApiProperty({
    description: 'The total amount of the order',
    example: 299.99,
    type: 'number',
    minimum: 0,
  })
  @Column({ type: 'numeric', precision: 10, scale: 2 })
  total_amount: number;

  @ApiProperty({
    description: 'The unique order number',
    example: '1001',
    uniqueItems: true,
  })
  @Column({ unique: true, default: 0 })
  @Index()
  order_number: string;

  @ApiProperty({
    description: 'The user who placed the order',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'SET NULL' })
  user: User;

  @ApiProperty({
    description: 'The items included in this order',
    type: () => [OrderItem],
  })
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[];

  @ApiProperty({
    description: 'The payment associated with this order',
    type: () => Payment,
  })
  @OneToOne(() => Payment)
  payment: Payment;
}
