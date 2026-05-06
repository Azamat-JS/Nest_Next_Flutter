import { Inject, Injectable } from "@nestjs/common";
import * as admin from 'firebase-admin';
import { ScoreCreatedEvent } from "src/lib/events/score_create_event";

@Injectable()
export class NotificationService {
    constructor(@Inject('FIREBASE_ADMIN') private firebaseApp: admin.app.App) { }

    async sendNotification(event: ScoreCreatedEvent) {
        const token = await this.getParentDeviceToken(event.studentId);
        await this.firebaseApp.messaging().send({
            token,
            notification: {
                title: 'New Score Added',
                body: `Your child received ${event.score} for ${event.type} on ${event.date}`
            },
            data: {
                studentId: event.studentId,
                type: event.type
            }
        });
    }

    async getParentDeviceToken(studentId: string): Promise<string> {
        return 'fake token';
    }
}