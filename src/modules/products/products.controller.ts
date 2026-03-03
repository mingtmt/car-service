import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductType } from '@generated/prisma/client';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(@Query('q') query?: string, @Query('type') type?: ProductType) {
    return this.productsService.findAll(query, type);
  }

  @Get(':id')
  findOne(@Query('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Query('id', ParseIntPipe) id: number,
    @Body() updateProductDto: CreateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Query('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
