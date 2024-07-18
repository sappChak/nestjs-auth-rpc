import { Controller, Get } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Get()
  public getHello(): string {
    return this.authService.getHello();
  }

  @MessagePattern({ cmd: 'get-user' })
  public async getUser(@Ctx() context: RmqContext) {
  }
}
