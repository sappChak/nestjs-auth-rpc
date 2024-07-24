import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from '../services/user.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { RmqInterceptor } from '@app/shared/interceptors/rmq.interceptor';

@Controller('users')
@UseInterceptors(RmqInterceptor)
export class UserController {
  public constructor(private readonly userService: UserService) { }

  @MessagePattern({ cmd: 'get-user-by-email' })
  public async getUserByEmail(@Payload() email: string): Promise<User> {
    return await this.userService.getUserByEmail(email);
  }

  @MessagePattern({ cmd: 'create-user' })
  public async createUser(@Payload() user: CreateUserDto): Promise<User> {
    return await this.userService.saveUser(user);
  }
}
