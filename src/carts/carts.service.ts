import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cartItem.entity';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  async create(createCartDto: CreateCartDto, user: User) {
    //find or create cart for a user
    let cart = await this.cartRepository.findOne({
      where: { user: { userId: user.userId } },
      relations: ['cartItems', 'cartItems.product'],
    });
    if (!cart) {
      cart = this.cartRepository.create({
        user,
        cartItems: [],
      });
      cart = await this.cartRepository.save(cart);
    }
    //find product
    const product = await this.productRepository.findOne({
      where: { productId: createCartDto.productId },
    });
    if (!product) {
      throw new NotFoundException('product not found');
    }
    const existingCartItem = cart.cartItems?.find(
      (item) => item.product.productId === createCartDto.productId,
    );
    if (existingCartItem) {
      existingCartItem.quantity++;
      if (existingCartItem.quantity > existingCartItem.product.quantity) {
        throw new ConflictException(
          'Requested quantity exceeds available stock',
        );
      }
      existingCartItem.price = product.price * existingCartItem.quantity;
      await this.cartItemRepository.save(existingCartItem);
      return existingCartItem;
    } else {
      const newCartItem = this.cartItemRepository.create({
        cart: cart,
        product,
        quantity: createCartDto.quantity,
        price: product.price,
      });
      const savedCartItem = await this.cartItemRepository.save(newCartItem);
      return savedCartItem;
    }
  }

  async findAll(userId: string) {
    return await this.cartRepository.find({
      where: { user: { userId } },
      relations: ['cartItems', 'cartItems.product'],
      select: {
        cartId: true,
        cartItems: {
          cartItemId: true,
          quantity: true,
          product: {
            productId: true,
            price: true,
            name: true,
            image_url: true,
          },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const cartItem = await this.cartRepository.findOne({
      where: {
        cartId: id,
        user: { userId },
      },
    });
    if (!cartItem) {
      throw new NotFoundException('cart not found');
    }
    return cartItem;
  }

  async update(cartItemId: string, updateCartDto: UpdateCartDto) {
    const cartItem = await this.cartItemRepository.findOne({
      where: { cartItemId },
      relations: ['product'],
    });
    if (!cartItem) {
      throw new NotFoundException('cart not found');
    }
    if (cartItem.quantity <= 0) {
      await this.cartItemRepository.remove(cartItem);
      return { message: 'cart cleared' };
    }

    cartItem.quantity += updateCartDto.quantity!;
    if (cartItem.quantity > cartItem.product.quantity) {
      throw new ConflictException('Requested quantity exceeds available stock');
    }
    return await this.cartItemRepository.update(cartItemId, cartItem);
  }

  async remove(id: string) {
    const cartItem = await this.cartItemRepository.findOne({
      where: { cartItemId: id },
    });
    // if (!cartItem) {
    //   throw new NotFoundException('cart not found');
    // }
    await this.cartItemRepository.remove(cartItem!);
    return { message: 'item removed from cart' };
  }

  async clearCart(userId: string) {
    const cart = await this.cartRepository.findOne({
      where: { user: { userId } },
      relations: ['cartItems'],
    });
    if (cart && cart.cartItems.length > 0) {
      await this.cartItemRepository.remove(cart.cartItems);
    }
    return { message: 'cart cleared successfully' };
  }
}
