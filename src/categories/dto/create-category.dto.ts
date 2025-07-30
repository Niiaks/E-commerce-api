import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'The name of the category',
    example: 'Electronics',
    required: true,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The URL of the category image',
    example: 'https://example.com/images/electronics.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  image_url?: string;
}
