import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseFormat<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: any;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ResponseFormat<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat<T>> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((res) => {
        // Handle paginated responses ({ data: [...], meta: {...} })
        if (
          res &&
          typeof res === 'object' &&
          'data' in res &&
          'meta' in res
        ) {
          return {
            success: true,
            statusCode,
            message: 'Operation successful',
            data: res.data,
            meta: res.meta,
          };
        }

        // Handle simple message objects ({ message: '...' })
        if (
          res &&
          typeof res === 'object' &&
          'message' in res &&
          Object.keys(res).length === 1
        ) {
          return {
            success: true,
            statusCode,
            message: res.message,
          };
        }

        return {
          success: true,
          statusCode,
          message: 'Operation successful',
          data: res,
        };
      }),
    );
  }
}
