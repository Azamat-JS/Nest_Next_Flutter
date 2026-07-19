import { PaymentMethod } from "./payment_type";

export type DashboardStats = {
    month: number;
    year: number;
    leads: number;
    groups: number;
    teachers: number;
    students: number;
    groupMemberships: number;
    rooms: number;
    debtors: number;
    paidCount: number;
    monthIncome: number;
    averagePayment: number;
}

export type PaymentsChart = {
    year: number;
    monthly: { month: number; total: number }[];
    methods: { method: PaymentMethod; total: number; count: number }[];
}

export type RoomType = {
    id: string;
    name: string;
    createdAt?: string;
    _count?: { lessonSchedules: number };
}

export type CourseType = {
    id: string;
    name: string;
    price: string; // Prisma Decimal serialized as string
    durationMonths: number;
    description: string | null;
    createdAt?: string;
}

export type HolidayType = {
    id: string;
    date: string; // ISO date string
    reason: string;
    createdAt?: string;
}

export type ScheduleLesson = {
    id: string;
    dayOfWeek: number; // ISO-8601: 1 = Monday ... 7 = Sunday
    time: string; // "HH:mm"
    durationMinutes: number;
    roomId: string | null;
    group: {
        id: string;
        name: string;
        teacher: { firstName: string; lastName: string | null } | null;
    };
}

export type DashboardSchedule = {
    rooms: { id: string; name: string }[];
    lessons: ScheduleLesson[];
}

export type OrganizationSettings = {
    name: string;
    logoUrl: string | null;
    workStartTime: string; // "HH:mm"
    workEndTime: string; // "HH:mm"
}

export type BranchType = {
    id: string;
    name: string;
    createdAt?: string;
}
