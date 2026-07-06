export type TokenPayload = {
    id: string;
    phone: string;
    firstName: string;
    lastName?: string | null;
    password?: string | null;
    role?: string | null;
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


