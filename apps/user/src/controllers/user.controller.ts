import { Controller, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { RmqService } from '@app/shared/rmq/rmq.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  public constructor(
    private readonly userService: UserService,
    private readonly rmqService: RmqService,
  ) { }

  @MessagePattern({ cmd: 'get-user-by-email' })
  public async getUserByEmail(
    @Payload() email: string,
    @Ctx() context: RmqContext,
  ): Promise<User> {
    this.logger.debug('User email: ', email);
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
