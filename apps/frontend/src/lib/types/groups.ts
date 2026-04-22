import { TokenPayload } from "./token_payload";

export type GroupType = {
    id: string,
    name: string;
    teacherId: string;
    teacher: TokenPayload | null;
    students: TokenPayload[];
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
