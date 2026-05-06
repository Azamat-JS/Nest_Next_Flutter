export class ScoreCreatedEvent {
    constructor(
        public readonly studentId: string,
        public readonly score: number,
        public readonly type: 'HOMEWORK' | 'ATTENDANCE' | 'EXAM' | 'QUIZ',
        public readonly date: Date,
    ) { }
}