
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../shared/decorators/roles';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) return false;

        if (user.role && requiredRoles.includes(user.role)) {
            return true;
        }

        const membershipRoles: string[] = Array.isArray(user.membershipRoles) ? user.membershipRoles : [];
        return membershipRoles.some((role) => requiredRoles.includes(role));
    }
}
