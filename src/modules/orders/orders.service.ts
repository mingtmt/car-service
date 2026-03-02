import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Prisma } from '@generated/prisma/client';

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
}
