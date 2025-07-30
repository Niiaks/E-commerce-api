import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CartItem } from './cartItem.entity';
import { DbEntity } from 'src/interfaces/Db-interface';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Cart extends DbEntity {
  @ApiProperty({
    description: 'The unique ID of the cart',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  cartId: string;

  @ApiProperty({ description: 'The user associated with the cart' })
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ApiProperty({ description: 'The items in the cart' })
  @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
  cartItems: CartItem[];
}
