import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
