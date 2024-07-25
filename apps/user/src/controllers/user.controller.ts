import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RmqInterceptor } from '@app/shared/interceptors/rmq.interceptor';
import { UserService } from '../services/user.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

@Controller()
@UseInterceptors(RmqInterceptor)
export class UserController {
  public constructor(private readonly userService: UserService) { }

  @MessagePattern({ cmd: 'get-user-by-email' })
  public async getUserByEmail(@Payload() email: string): Promise<User> {
    return this.userService.getUserByEmail(email);
  }

  @MessagePattern({ cmd: 'get-all-users' })
  public async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @MessagePattern({ cmd: 'get-user-by-id' })
  public async getUserById(@Payload() id: number): Promise<User> {
    return this.userService.getUserById(id);
  }

  @MessagePattern({ cmd: 'create-user' })
  public async createUser(@Payload() user: CreateUserDto): Promise<User> {
    return this.userService.createOrUpdateUser(user);
  }
}
