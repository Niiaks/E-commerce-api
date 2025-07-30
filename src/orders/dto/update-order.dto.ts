import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderDto {
  @ApiProperty({
    description: 'The new status of the order',
    enum: OrderStatus,
    example: OrderStatus.PLACED,
    required: true,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
