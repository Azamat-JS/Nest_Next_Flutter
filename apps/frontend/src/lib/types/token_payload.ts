export type TokenPayload = {
    id: string;
    email: string;
    username: string;
    password?: string | null;
    role?: string | null;
}

export type LeaderBoardType = {
    studentId: string;
    groupId: string;
    total: number;
    attendance: number;
    homework: number;
    student: { username: string }
}


