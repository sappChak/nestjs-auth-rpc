import {
        CanActivate,
        ExecutionContext,
        Inject,
        Injectable,
        UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
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
                const token = this.extractToken(request.headers['authorization']);

                return firstValueFrom(
                        this.tokenClient.send({ cmd: 'verify-access-token' }, token),
                )
                        .then((user) => {
                                request.user = user;
                                return true;
                        })
                        .catch(() => {
                                throw new UnauthorizedException('Invalid access token');
                        });
        }

        private extractToken(authorization: string): string {
                if (!authorization)
                        throw new UnauthorizedException('Access token is not provided');
                const [bearer, token] = authorization.split(' ');
                if (bearer !== 'Bearer' || !token)
                        throw new UnauthorizedException('Invalid access token');
                return token;
        }
}
