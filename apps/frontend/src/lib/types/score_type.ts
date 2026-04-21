export type ScoreType = 'HOMEWORK' | 'ATTENDANCE';

export type StudentScoreRow = {
    studentId: string;
    username: string;
    homework: number;
    attendance: number;
    date: string;
    total: number;
}

