import {
        CanActivate,
        ExecutionContext,
        Inject,
        Injectable,
        UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { TOKEN_SERVICE } from '../constants/constants';

@Injectable()
export class JwtAuthGuard implements CanActivate {
        public constructor(
                @Inject(TOKEN_SERVICE) private readonly tokenClient: ClientProxy,
        ) { }

        public canActivate(
                context: ExecutionContext,
        ): boolean | Promise<boolean> | Observable<boolean> {
                const request = context.switchToHttp().getRequest();
                const authorization = request.headers['authorization'];

                if (!authorization)
                        throw new UnauthorizedException('Access token is not provided');

                const [bearer, token] = authorization.split(' ');
                if (bearer !== 'Bearer' || !token)
                        throw new UnauthorizedException('Invalid access token');

                request.user = this.tokenClient.send('verify-access-token', token);

                return true;
        }
}
