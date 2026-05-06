import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter"
import { ScoreCreatedEvent } from "src/lib/events/score_create_event";
import { NotificationService } from "src/lib/shared/services/notification.service";

@Injectable()
export class StudentScoreEventListener {
    constructor(private notificationService: NotificationService) { }

    @OnEvent('score.created')
    async handleScoreCreated(event: ScoreCreatedEvent) {
        await this.notificationService.sendNotification(event)
    }
}