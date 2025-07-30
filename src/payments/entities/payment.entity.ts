import { ApiProperty } from '@nestjs/swagger';
import { DbEntity } from 'src/interfaces/Db-interface';
import { Order } from 'src/orders/entities/order.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity()
export class Payment extends DbEntity {
  @ApiProperty({
    description: 'The unique identifier of the payment',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @PrimaryGeneratedColumn('uuid')
  paymentId: string;

  @ApiProperty({
    description:
      'The payment amount in the smallest currency unit (e.g., kobo for NGN)',
    example: 50000,
    type: 'number',
    minimum: 0,
  })
  @Column('numeric')
  amount: number;

  @ApiProperty({
    description: 'The payment reference from the payment provider',
    example: 'ref_123456789',
    required: false,
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  reference: string;

  @ApiProperty({
    description: 'The current status of the payment',
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
    default: PaymentStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @ApiProperty({
    description: 'The order associated with this payment',
    type: () => Order,
  })
  @OneToOne(() => Order)
  @JoinColumn()
  order: Order;
}
