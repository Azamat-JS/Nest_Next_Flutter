export type ScoreType = 'HOMEWORK' | 'ATTENDANCE';

export type StudentScoreRow = {
    studentId: string;
    firstName: string;
    lastName?: string | null;
    homework: number;
    attendance: number;
    date: string;
    total: number;
    comment: string | null;
}

export type ScoreEvent = {
    date: string;
    homework: number | null;
    attendance: number | null;
    homeworkComment: string | null;
    attendanceComment: string | null;
    total: number
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