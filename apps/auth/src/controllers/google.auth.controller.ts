import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RmqInterceptor } from '@app/shared/interceptors/rmq.interceptor';
import { GoogleAuthService } from '../services/google.auth.service';
import { AuthResponseDto } from '../dtos/auth-response.dto';

@Controller()
@UseInterceptors(RmqInterceptor)
export class GoogleAuthController {
  public constructor(private readonly googleAuthService: GoogleAuthService) { }

  @MessagePattern({ cmd: 'login-with-google' })
  public async handleLoginWithGoogle(
    @Payload() data: { code: string; state: string },
  ): Promise<AuthResponseDto> {
    return this.googleAuthService.authenticateWithGoogle(data.code, data.state);
  }
}
