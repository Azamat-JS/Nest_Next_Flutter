export type TokenPayload = {
    id: string;
    email: string;
    username: string;
    password?: string | null;
    role?: string | null;
}

export type LeaderBoard = {
    studentId: string;
    groupId: string;
    username: string;
    total: number;
    attendance: number;
    homework: number;
}


