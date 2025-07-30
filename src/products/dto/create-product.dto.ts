import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'The name of the product',
    example: 'iPhone 12 Pro',
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'A detailed description of the product',
    example: 'The latest iPhone with amazing features and capabilities',
    type: String,
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'The available quantity of the product in stock',
    example: 100,
    minimum: 0,
    type: Number,
  })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({
    description: 'The price of the product in the smallest currency unit',
    example: 99999,
    minimum: 0,
    type: Number,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'The URL of the product image',
    example: 'https://example.com/images/iphone12.jpg',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiProperty({
    description: 'Array of category IDs this product belongs to',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '987fcdeb-51a2-12d3-a456-426614174000',
    ],
    required: false,
    type: [String],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  categoryIds?: string[];
}
