import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: createCustomerDto,
    });
  }

  async findAll(query?: string) {
    return this.prisma.customer.findMany({
      where: {
        ...(query && {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query } },
            { plateNumber: { contains: query, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  async remove(id: number) {
    return this.prisma.customer.delete({
      where: { id },
    });
  }
}
