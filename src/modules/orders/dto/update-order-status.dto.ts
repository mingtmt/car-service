import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '@generated/prisma/client';

export class UpdateOrderStatusDto {
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(OrderStatus, { message: 'Status is not valid' })
  status: OrderStatus;
}