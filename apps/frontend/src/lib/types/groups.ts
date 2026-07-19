import { TokenPayload } from "./token_payload";

export type LessonScheduleType = {
    dayOfWeek: number; // ISO-8601: 1 = Monday ... 7 = Sunday
    time: string; // "HH:mm"
    durationMinutes?: number;
    roomId?: string | null;
    room?: { id: string; name: string } | null;
}

export type GroupType = {
    id: string,
    name: string;
    teacherId: string;
    teacher: TokenPayload | null;
    students: TokenPayload[];
    lessonSchedules?: LessonScheduleType[];
    createdAt: Date;
}

export type PaginationType = {
    total: number;
    page: number;
    last_page: number;
    limit: number;
}

export type AddStudentPayload = {
    groupId: string;
    studentIds: string[];
}
