import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { Order } from '../orders/entities/order.entity';
import { Cart } from '../carts/entities/cart.entity';
import { Payment } from '../payments/entities/payment.entity';
import { CartItem } from '../carts/entities/cartItem.entity';
import { ProductCategory } from '../categories/entities/productCategory.entity';
import { OrderItem } from '../orders/entities/orderItem.entity';

export const entities = [
  User,
  Product,
  Category,
  Order,
  Cart,
  Payment,
  CartItem,
  ProductCategory,
  OrderItem,
];
