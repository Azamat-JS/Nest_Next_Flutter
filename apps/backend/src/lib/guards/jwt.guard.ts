import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { AppConfig } from "../config";
import { IS_PUBLIC_KEY } from "../shared/decorators/public";
import { IS_PLATFORM_ROUTE_KEY } from "../shared/decorators/platform-route";
import { ALLOW_PENDING_PASSWORD_CHANGE_KEY } from "../shared/decorators/allow-pending-password-change";
import { TenantContextService } from "../tenant/tenant-context.service";


@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private readonly config: AppConfig,
        private readonly reflector: Reflector,
        private readonly tenantContext: TenantContextService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) return true;

        const isPlatformRoute = this.reflector.getAllAndOverride<boolean>(IS_PLATFORM_ROUTE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPlatformRoute) return true;

        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        let accessToken: string;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            accessToken = authHeader.split(' ')[1];
        } else {
            throw new UnauthorizedException('No token provided')
        }

        let payload: any;
        try {
            payload = await this.jwtService.verify(accessToken, {
                secret: this.config.JWT_SECRET,
            });
        } catch (error) {
            throw new UnauthorizedException('Invalid token or token expired');
        }

        if (payload.type !== 'tenant') {
            throw new UnauthorizedException('Invalid token');
        }

        request['user'] = payload;
        this.tenantContext.setTenantId(payload.tenantId);

        const allowPendingPasswordChange = this.reflector.getAllAndOverride<boolean>(
            ALLOW_PENDING_PASSWORD_CHANGE_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (payload.mustChangePassword && !allowPendingPasswordChange) {
            throw new ForbiddenException({
                code: 'PASSWORD_CHANGE_REQUIRED',
                message: 'You must change your password before continuing',
            });
        }

        return true;
    }
}
