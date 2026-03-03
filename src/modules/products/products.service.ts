import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { ProductType } from '@generated/prisma/client';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const data = { ...createProductDto };
    if (data.type === ProductType.SERVICE) {
      data.stock = 0;
    }

    return this.prisma.product.create({ data });
  }

  async findAll(query?: string, type?: ProductType) {
    return this.prisma.product.findMany({
      where: {
        ...(type && { type }),
        ...(query && {
          OR: [
            { code: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateProductDto: CreateProductDto) {
    const data = { ...updateProductDto };

    if (data.type === ProductType.SERVICE) {
      data.stock = 0;
    }

    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
