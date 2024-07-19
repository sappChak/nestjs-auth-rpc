import { Controller } from '@nestjs/common';
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

@ApiTags('Users')
@Controller('/users')
export class UserController {
  public constructor(private readonly userService: UserService) { }

  @MessagePattern('get-user-by-email')
  public async getUserByEmail(
    @Payload() userId: string,
    @Ctx() context: RmqContext,
  ): Promise<User> {
    const user = await this.userService.getUserByEmail(userId);
    this.acknowledgeMessage(context);
    return user;
  }

  @MessagePattern({ cmd: 'create-user' })
  public async createUser(
    @Payload() user: CreateUserDto,
    @Ctx() context: RmqContext,
  ): Promise<User> {
    const newUser = await this.userService.saveUser(user);
    this.acknowledgeMessage(context);
    return newUser;
  }

  private acknowledgeMessage(context: RmqContext): void {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
  }
}
