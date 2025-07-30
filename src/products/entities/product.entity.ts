import { ApiProperty } from '@nestjs/swagger';
import { CartItem } from 'src/carts/entities/cartItem.entity';
import { ProductCategory } from 'src/categories/entities/productCategory.entity';
import { DbEntity } from 'src/interfaces/Db-interface';
import { OrderItem } from 'src/orders/entities/orderItem.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product extends DbEntity {
  @ApiProperty({
    description: 'The unique identifier of the product',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @PrimaryGeneratedColumn('uuid')
  productId: string;

  @ApiProperty({
    description: 'The name of the product',
    example: 'iPhone 12 Pro',
    type: String,
  })
  @Column('text')
  name: string;

  @ApiProperty({
    description: 'A detailed description of the product',
    example: 'The latest iPhone with amazing features and capabilities',
    type: String,
  })
  @Column('text')
  description: string;

  @ApiProperty({
    description: 'The available quantity of the product in stock',
    example: 100,
    minimum: 0,
    default: 1,
    type: Number,
  })
  @Column({ type: 'integer', default: 1 })
  quantity: number;

  @ApiProperty({
    description: 'The price of the product in the smallest currency unit',
    example: 99999.99,
    minimum: 0,
    type: Number,
  })
  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({
    description: 'The URL of the product image',
    example: 'https://example.com/images/iphone12.jpg',
    type: String,
  })
  @Column('text')
  image_url: string;

  @ApiProperty({
    description: 'Cart items containing this product',
    type: () => [CartItem],
  })
  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];

  @ApiProperty({
    description: 'Order items containing this product',
    type: () => [OrderItem],
  })
  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @ApiProperty({
    description: 'Categories this product belongs to',
    type: () => [ProductCategory],
  })
  @OneToMany(() => ProductCategory, (pc) => pc.product)
  products: ProductCategory[];
}
