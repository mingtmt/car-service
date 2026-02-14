import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message.replace(/\n/g, '');

    switch (exception.code) {
      // P2002: Unique constraint failed
      case 'P2002': {
        const status = HttpStatus.CONFLICT;
        const target = exception.meta?.target;
        const errorMsg = `This record already exists (Conflict: ${target})`;

        this.logger.warn(`[P2002] ${errorMsg}`);

        response.status(status).json({
          statusCode: status,
          message: errorMsg,
          error: 'Conflict',
        });
        break;
      }

      // P2025: Record not found (Can't find the record to update/delete)
      case 'P2025': {
        const status = HttpStatus.NOT_FOUND;
        const errMsg = 'Record not found';

        this.logger.warn(`[P2025] ${errMsg}`);

        response.status(status).json({
          statusCode: status,
          message: errMsg,
          error: 'Not Found',
        });
        break;
      }

      // TODO: Implement other Prisma exceptions

      default:
        this.logger.error(`[Prisma Error] ${message}`, exception.stack);

        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal Server Error',
        });
        break;
    }
  }
}
