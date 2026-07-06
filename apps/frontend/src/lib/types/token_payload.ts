export type TokenPayload = {
    id: string;
    phone: string;
    firstName: string;
    lastName?: string | null;
    password?: string | null;
    role?: string | null;
    tenantId?: string;
    mustChangePassword?: boolean;
    type?: 'tenant';
}

export type CreateUserPayload = {
    firstName: string;
    lastName?: string;
    phone: string;
    password: string;
    role: string;
}

export type LeaderBoardType = {
    total: number;
    attendance: number;
    homework: number;
    student: { firstName: string; lastName?: string | null };
    group?: { name: string };
}

export type UpdateScorePayload = {
    studentId: string;
    groupId: string;
    type: "HOMEWORK" | "ATTENDANCE";
    date: string;
    value: number;
    comment?: string | null;
};

export type DeleteStudentPayload = {
    studentId: string;
    groupId: string;
}


