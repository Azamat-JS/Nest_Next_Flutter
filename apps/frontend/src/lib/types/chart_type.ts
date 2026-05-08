export type ChartType = {
    date: string;
    homework: number;
    attendance: number;
}

export type ChartResponse = {
    scores: ChartType[];
}