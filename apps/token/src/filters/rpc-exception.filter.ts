import { Catch, ExceptionFilter, ArgumentsHost, Logger } from '@nestjs/common';
import { RmqContext, RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcExceptionFilter.name);

  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToRpc();
    const message = ctx.getContext<RmqContext>().getMessage();
    const error = exception.getError();

    this.logger.error(`Failed to process message: ${message.content.toString()}`, error);
  }
}

