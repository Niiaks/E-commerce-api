import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/products/entities/product.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { DbEntity } from 'src/interfaces/Db-interface';

@Entity()
export class OrderItem extends DbEntity {
  @ApiProperty({
    description: 'The unique identifier of the order item',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @PrimaryGeneratedColumn('uuid')
  orderItemId: string;

  @ApiProperty({
    description: 'The total amount for this item (quantity * unit price)',
    example: 299.99,
    type: 'number',
    minimum: 0,
  })
  @Column('numeric')
  total_amount: number;

  @ApiProperty({
    description: 'The quantity of the product ordered',
    example: 2,
    type: 'integer',
    minimum: 1,
  })
  @Column('integer')
  quantity: number;

  @ApiProperty({
    description: 'The product associated with this order item',
    type: () => Product,
  })
  @ManyToOne(() => Product, (product) => product.orderItems)
  product: Product;

  @ApiProperty({
    description: 'The order this item belongs to',
    type: () => Order,
  })
  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  order: Order;
}
