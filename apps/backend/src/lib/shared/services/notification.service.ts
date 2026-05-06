import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import * as admin from 'firebase-admin';
import { ScoreCreatedEvent } from "src/lib/events/score_create_event";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class NotificationService {
    constructor(@Inject('FIREBASE_ADMIN') private firebaseApp: admin.app.App, private readonly prisma: PrismaService) { }

    async sendNotification(event: ScoreCreatedEvent) {
        try {
            const token = await this.getParentDeviceToken(event.studentId);
            const student = await this.prisma.users.findUnique({ where: { id: event.studentId, role: 'STUDENT' } });

            if (!student) throw new NotFoundException('Student not found');

            await this.firebaseApp.messaging().send({
                token,
                notification: {
                    title: 'New Score Added',
                    body: `${student.username} received ${event.score} for ${event.type.toLowerCase()}}`
                },
                data: {
                    studentId: event.studentId,
                    type: event.type
                }
            });
        } catch (error) {

        }
    }

    async getParentDeviceToken(studentId: string): Promise<string> {
        return 'fake token';
    }
}