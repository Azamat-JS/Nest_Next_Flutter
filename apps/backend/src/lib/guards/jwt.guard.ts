import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AppConfig } from "../config";


@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private readonly config: AppConfig,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        let accessToken: string;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            accessToken = authHeader.split(' ')[1];
        } else {
            throw new UnauthorizedException('No token provided')
        }

        try {
            const payload = await this.jwtService.verify(accessToken, {
                secret: this.config.JWT_SECRET,
            });
            request['user'] = payload;
            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid token or token expired');
        }
    }
}