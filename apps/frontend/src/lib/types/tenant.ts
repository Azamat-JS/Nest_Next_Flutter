export type TenantStatus = "ACTIVE" | "SUSPENDED"

export type TenantType = {
    id: string;
    name: string;
    status: TenantStatus;
    botToken?: string | null;
    botUsername?: string | null;
    createdAt: string;
    updatedAt: string;
}

export type CreateTenantPayload = {
    name: string;
    ownerFirstName: string;
    ownerLastName?: string;
    ownerPhone: string;
    ownerPassword: string;
    botToken?: string;
}

export type CreateTenantResponse = {
    tenant: TenantType;
    owner: {
        id: string;
        phone: string;
        firstName: string;
        lastName?: string | null;
        role: string;
    };
}

export type UpdateTenantStatusPayload = {
    status: TenantStatus;
}
