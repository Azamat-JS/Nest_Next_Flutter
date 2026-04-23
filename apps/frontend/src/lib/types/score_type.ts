export type ScoreType = 'HOMEWORK' | 'ATTENDANCE';

export type StudentScoreRow = {
    studentId: string;
    username: string;
    homework: number;
    attendance: number;
    date: string;
    total: number;
}

export type ScoreEvent = {
    type: "HOMEWORK" | "ATTENDANCE";
    value: number;
    date: string;
}

export type StudentScoreResponse = {
    scores: ScoreEvent[];
    total: { total: number };
}

