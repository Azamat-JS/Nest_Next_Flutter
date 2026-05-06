import { Inject, Injectable } from "@nestjs/common";
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationService {
    constructor(@Inject('FIREBASE_ADMIN') private firebaseApp: admin.app.App) { }

    async sendNotification(token: string) {
        await this.firebaseApp.messaging().send({
            token,
            notification: {
                title: 'Text',
                body: 'Hi, this is from backend'
            }
        })
    }
}