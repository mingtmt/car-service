import {
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
  IsString,
  Min,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCustomerDto } from '../../customers/dto/create-customer.dto';

// DTO for order item
export class CreateOrderItemDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @Min(1, { message: 'Quantity no less than 1' })
  quantity: number;
}

// DTO for order
export class CreateOrderDto {
  // Case 1: Customer exists
  @IsOptional()
  @IsInt()
  customerId?: number;

  // Case 2: New customer
  @ValidateIf((o) => !o.customerId)
  @ValidateNested()
  @Type(() => CreateCustomerDto)
  newCustomer?: CreateCustomerDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  orderItems: CreateOrderItemDto[];

  @IsOptional()
  @IsString()
  note?: string;
}
