import { Provider } from "@nestjs/common";
import * as admin from 'firebase-admin';
import { AppConfig } from "src/lib/config";


export const FirebaseAdminProvider: Provider = {
    provide: 'FIREBASE_ADMIN',
    inject: [AppConfig],
    useFactory: (config: AppConfig) => {
        return admin.initializeApp({
            credential: admin.credential.cert({
                projectId: config.FIREBASE_PROJECT_ID,
                clientEmail: config.FIREBASE_CLIENT_EMAIL,
                privateKey: config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            })
        })
    }
}