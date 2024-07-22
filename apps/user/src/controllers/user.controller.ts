import {
  Controller,
  Logger,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { RpcExceptionFilter } from 'apps/token/src/filters/rpc-exception.filter';
import { LoggingInterceptor } from 'apps/token/src/interceptors/logger.interceptor';
import { UserService } from '../services/user.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { RmqService } from '@app/shared/rmq/rmq.service';

@ApiTags('Users')
@Controller('users')
@UseFilters(RpcExceptionFilter)
@UseInterceptors(LoggingInterceptor)
export class UserController {
  public constructor(
    private readonly userService: UserService,
    private readonly rmqService: RmqService,
  ) { }

  @MessagePattern({ cmd: 'get-user-by-email' })
  public async getUserByEmail(
    @Payload() email: string,
    @Ctx() context: RmqContext,
  ): Promise<User> {
    const user = await this.userService.getUserByEmail(email);
    this.rmqService.acknowledgeMessage(context);
    return user;
  }

  @MessagePattern({ cmd: 'create-user' })
  public async createUser(
    @Payload() user: CreateUserDto,
    @Ctx() context: RmqContext,
  ): Promise<User> {
    const newUser = await this.userService.saveUser(user);
    this.rmqService.acknowledgeMessage(context);
    return newUser;
  }
}
