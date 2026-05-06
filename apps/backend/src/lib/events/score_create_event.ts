export class ScoreCreatedEvent {
    constructor(
        public readonly studentId: string,
        public readonly score: number,
        public readonly type: 'homework' | 'attendance',
        public readonly date: Date,
    ) { }
}