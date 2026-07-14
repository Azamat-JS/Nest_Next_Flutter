export type HomeworkType = {
    id: string;
    topic: string;
    dueDate: string;
    // UTC-midnight date of the lesson this homework belongs to; null on
    // rows created before lesson days existed.
    lessonDate?: string | null;
    createdAt: string;
    groupId: string;
}
