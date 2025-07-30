export const CACHE_PREFIXES = {
  PRODUCT: 'product',
  PRODUCTS: 'products',
  CART: 'cart',
  ORDER: 'order',
  ORDERS: 'orders',
  USER: 'user',
  CATEGORY: 'category',
} as const;

export const TIME_T0_EXPIRE_MS = 7 * 24 * 60 * 60 * 1000;
export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
  VERY_VERY_LONG: 604800, // 1 week
} as const;

export const CACHE_KEYS = {
  REFRESH_TOKEN: (token: string) => `refreshToken:${token}`,
  PRODUCT_BY_ID: (id: string) => `${id}`,
  PRODUCTS_ALL: 'all',
  PRODUCTS_BY_CATEGORY: (categoryId: string) => `category:${categoryId}`,
  CATEGORY_BY_ID: (id: string) => `${id}`,
  CART_BY_USER: (userId: string) => `user:${userId}`,
  CART_BY_ID: (id: string) => `${id}`,
  ORDER_BY_ID: (id: string) => `${id}`,
  ORDERS_BY_USER: (userId: string) => `user:${userId}`,
  IDEMPOTENCY: (key: string) => `idempotency:${key}`,
} as const;
