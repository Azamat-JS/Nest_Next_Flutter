export type TokenPayload = {
    id: string;
    email: string;
    username: string;
    password?: string | null;
    role?: string | null;
}

export type LeaderBoardType = {
    total: number;
    attendance: number;
    homework: number;
    student: { username: string };
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


