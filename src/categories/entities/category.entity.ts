import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductCategory } from './productCategory.entity';
import { DbEntity } from 'src/interfaces/Db-interface';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Category extends DbEntity {
  @ApiProperty({
    description: 'The unique identifier of the category',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @PrimaryGeneratedColumn('uuid')
  categoryId: string;

  @ApiProperty({
    description: 'The name of the category',
    example: 'Electronics',
    type: String,
  })
  @Column('text')
  name: string;

  @ApiProperty({
    description: 'The URL of the category image',
    example: 'https://example.com/images/electronics.jpg',
    type: String,
  })
  @Column('text')
  image_url: string;

  @ApiProperty({
    description: 'The products associated with this category',
    type: () => [ProductCategory],
  })
  @OneToMany(() => ProductCategory, (pc) => pc.category)
  categories: ProductCategory[];
}
