export type GroupType = {
    id: string,
    name: string;
    teacherId: string;
    teacher: TeacherType | null;
}

export type TeacherType = {
    username: string;
}


