import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsOptional,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { ProductType } from '@generated/prisma/client';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Code is required' })
  code: string;

  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsNumber()
  @Min(0, { message: 'Price no less than zero' })
  price: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  costPrice?: number;

  @IsEnum(ProductType, { message: 'Type is PART or SERVICE' })
  type: ProductType;

  @ValidateIf((o) => o.type === ProductType.PART)
  @IsNumber()
  @Min(0, { message: 'Stock no less than zero' })
  stock?: number;

  @IsString()
  @IsNotEmpty({ message: 'Unit is required' })
  unit: string;
}
