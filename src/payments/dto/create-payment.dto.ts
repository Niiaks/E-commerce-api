import { IsString, IsEmail, IsUUID, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from 'src/orders/entities/order.entity';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'The email address of the customer',
    example: 'customer@example.com',
    format: 'email',
  })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    description:
      'The payment amount in the smallest currency unit (e.g., kobo for NGN)',
    example: '50000', // Represents ghc 500.00
    type: String,
  })
  @IsString()
  amount: string;

  @ApiProperty({
    description: 'The unique identifier of the user making the payment',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'The unique identifier of the order being paid for',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsString()
  orderId: string;
}
