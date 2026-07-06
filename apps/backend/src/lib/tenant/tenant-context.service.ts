import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

export const TENANT_ID_KEY = 'tenantId';

@Injectable()
export class TenantContextService {
    constructor(private readonly cls: ClsService) { }

    setTenantId(tenantId: string) {
        this.cls.set(TENANT_ID_KEY, tenantId);
    }

    getTenantId(): string | undefined {
        return this.cls.get<string>(TENANT_ID_KEY);
    }
}
