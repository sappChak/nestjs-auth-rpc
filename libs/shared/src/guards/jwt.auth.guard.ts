import {
        CanActivate,
        ExecutionContext,
        Inject,
        Injectable,
        UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { AUTH_SERVICE } from '../constants/constants';

@Injectable()
export class JwtAuthGuard implements CanActivate {
        public constructor(@Inject(AUTH_SERVICE)private readonly tokenClient: ClientProxy) { }

        public canActivate(
                context: ExecutionContext,
        ): boolean | Promise<boolean> | Observable<boolean> {
                const request = context.switchToHttp().getRequest();
                const authorization = request.headers['authorization'];

                if (!authorization) {
                        throw new UnauthorizedException('Token not provided');
                }
                const [bearer, token] = authorization.split(' ');
                if (bearer !== 'Bearer' || !token) {
                        throw new UnauthorizedException('Invalid token');
                }
                request.user = this.tokenClient.send('verify-access-token', token);
                return true;
        }
}
