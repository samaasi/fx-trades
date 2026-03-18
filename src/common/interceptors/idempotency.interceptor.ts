import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisService } from '../../infrastructure/cache/redis.service';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly redisService: RedisService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const idempotencyKey = request.headers['x-idempotency-key'];

    if (request.method !== 'POST' || !idempotencyKey) {
      return next.handle();
    }

    const cacheKey = `idempotency_${idempotencyKey}`;
    const cachedResponse = await this.redisService.get(cacheKey);

    if (cachedResponse) {
      const response = JSON.parse(cachedResponse);
      if (response.status === 'processing') {
        throw new BadRequestException('Request is already being processed');
      }
      return of(response.data);
    }

    await this.redisService.set(cacheKey, JSON.stringify({ status: 'processing' }), 60);

    return next.handle().pipe(
      tap(async (data) => {
        await this.redisService.set(
          cacheKey,
          JSON.stringify({ status: 'completed', data }),
          86400,
        );
      }),
    );
  }
}
