import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter"
import { ScoreCreatedEvent } from "src/lib/events/score_create_event";

@Injectable()
export class StudentScoreEventListener {
    constructor(private notificationService) { }

    @OnEvent('score.created')
    async handleScoreCreated(event: ScoreCreatedEvent) {
        await this.notificationService.sendScoreNotification(event)
    }
}