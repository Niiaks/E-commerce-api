import { Product } from 'src/products/entities/product.entity';
import { Entity, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { Category } from './category.entity';
import { DbEntity } from 'src/interfaces/Db-interface';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class ProductCategory extends DbEntity {
  @ApiProperty({
    description: 'The unique identifier of the product',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @PrimaryColumn('uuid')
  productId: string;

  @ApiProperty({
    description: 'The unique identifier of the category',
    example: '987fcdeb-51a2-12d3-a456-426614174000',
    format: 'uuid',
  })
  @PrimaryColumn('uuid')
  categoryId: string;

  @ApiProperty({
    description: 'The product associated with this category',
    type: () => Product,
  })
  @ManyToOne(() => Product, (product) => product.products, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ApiProperty({
    description: 'The category associated with this product',
    type: () => Category,
  })
  @ManyToOne(() => Category, (category) => category.categories, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;
}
