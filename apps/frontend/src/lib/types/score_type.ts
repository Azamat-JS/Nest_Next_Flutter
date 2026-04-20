export type ScoreType = 'HOMEWORK' | 'ATTENDANCE';

export type GroupStudentScore = {
    studentId: string;
    type: ScoreType;
    value: number;
    createdAt: Date;
    student: StudentUsername;
}

type StudentUsername = {
    username: string;
}