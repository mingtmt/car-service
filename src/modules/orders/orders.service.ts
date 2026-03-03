import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Prisma, ProductType } from '@generated/prisma/client';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      let finalCustomerId = createOrderDto.customerId;

      if (!finalCustomerId && createOrderDto.newCustomer) {
        const newCust = await tx.customer.create({
          data: createOrderDto.newCustomer,
        });
        finalCustomerId = newCust.id;
      }

      if (!finalCustomerId) {
        throw new BadRequestException('Please provide customer ID');
      }

      let totalAmount = 0;
      const orderItemsData: Prisma.OrderItemCreateManyOrderInput[] = [];

      for (const item of createOrderDto.orderItems) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(
            `Product ID ${item.productId} is not found`,
          );
        }

        const currentPrice = product.price;
        totalAmount += currentPrice * item.quantity;

        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: currentPrice,
        });
      }

      // TODO: create func to generate order code
      const orderCode = `DH-${Date.now()}`;

      // Save order
      const order = await tx.order.create({
        data: {
          code: orderCode,
          customerId: finalCustomerId,
          status: 'QUOTE',
          totalAmount: totalAmount,
          note: createOrderDto.note,
          orderItems: {
            createMany: {
              data: orderItemsData,
            },
          },
        },
        include: {
          customer: true,
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      return order;
    });
  }

  async updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        }
      })

      if (!order) {
        throw new NotFoundException(`Order ${id} not found`);
      }

      if (updateOrderStatusDto.status === 'CONFIRMED') {
        if (order.status !== 'QUOTE') {
          throw new BadRequestException('Order status is not QUOTE');
        }
      }

      if (updateOrderStatusDto.status === 'COMPLETED') {
        if (order.status === 'COMPLETED') {
          throw new BadRequestException('Order status is already COMPLETED');
        }
        if (order.status === 'CANCELLED') {
          throw new BadRequestException('Order status is CANCELLED');
        }

        for (const item of order.orderItems) {
          if (item.product.type === ProductType.PART) {
            if (item.quantity > item.product.stock) {
              throw new BadRequestException(
                `Product ${item.product.name} is out of stock`,
              );
            }

            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });
          }
        }
      }

      return tx.order.update({
        where: { id },
        data: { status: updateOrderStatusDto.status },
      });
    })
  }
}
