import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from 'src/products/entities/product.entity';
import { DbEntity } from 'src/interfaces/Db-interface';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class CartItem extends DbEntity {
  @ApiProperty({
    description: 'The unique identifier for the cart item',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  cartItemId: string;

  @ApiProperty({
    description: 'The quantity of the product in the cart',
    example: 2,
  })
  @Column('integer', { default: 1 })
  quantity: number;

  @ApiProperty({
    description: 'The price of the product in the cart',
    example: 29.99,
  })
  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ type: () => Cart })
  @ManyToOne(() => Cart, (cart) => cart.cartItems, { onDelete: 'CASCADE' })
  cart: Cart;

  @ApiProperty({ type: () => Product })
  @ManyToOne(() => Product, (product) => product.cartItems)
  product: Product;
}
