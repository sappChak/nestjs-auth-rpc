import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { RmqContext, RpcException } from '@nestjs/microservices';
import { RmqService } from '@app/shared/rmq/rmq.service';

@Injectable()
export class RmqInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RmqInterceptor.name);

  public constructor(private readonly rmqService: RmqService) {}

  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const ctx = context.switchToRpc().getContext<RmqContext>();
    return next.handle().pipe(
      tap(() => this.rmqService.acknowledgeMessage(ctx)),
      catchError((err) => {
        this.logger.error(
          `Failed to process message: ${ctx.getMessage().content.toString()}`,
          err,
        );
        this.rmqService.rejectMessage(ctx, false);
        throw new RpcException(err);
      }),
    );
  }
}
