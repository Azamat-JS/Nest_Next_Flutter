import { TokenPayload } from "./token_payload";

export type GroupType = {
    id: string,
    name: string;
    teacherId: string;
    teacher: TokenPayload | null;
    students: TokenPayload[];
}


