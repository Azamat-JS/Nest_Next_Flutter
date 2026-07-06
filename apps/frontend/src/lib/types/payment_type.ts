import { PaginationType } from "./groups";

export type StudentPaymentType = {
    id: string;
    studentId: string;
    groupId: string;
    month: number;
    year: number;
    amount: number;
    comment?: string | null;
    createdAt: string;
    updatedAt: string;
    student?: { id: string; username: string; email: string };
    group?: { id: string; name: string };
}

export type LatestPaymentsResponse = {
    data: StudentPaymentType[];
    meta: PaginationType;
}

export type StudentPaymentsResponse = {
    data: (StudentPaymentType & { group: { id: string; name: string } })[];
    meta: PaginationType;
}

export const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
