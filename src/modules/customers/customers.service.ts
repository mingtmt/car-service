import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { Prisma } from '@generated/prisma/client';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    try {
      return await this.prisma.customer.create({
        data: createCustomerDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002 is Prisma's error code for unique constraint violation
        if (error.code === 'P2002') {
          throw new ConflictException('This phone number is already exists');
        }
      }
      throw error;
    }
  }
}
