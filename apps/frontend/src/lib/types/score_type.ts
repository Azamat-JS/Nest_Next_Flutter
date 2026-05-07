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
    date: string;
    homework: number;
    attendance: number;
}

export type StudentScoreResponse = {
    scores: ScoreEvent[];
    total: { total: number };
    page: number;
    limit: number;
    total_count: number;
    last_page: number;
}

export type GroupScoreResponse = {
    students: StudentScoreRow[];
    avgHomework: number;
    avgAttendance: number;
    avg: number;
};