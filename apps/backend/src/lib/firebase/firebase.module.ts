import { Module } from "@nestjs/common";
import { FirebaseAdminProvider } from "./firebase_provider";

@Module({
    providers: [FirebaseAdminProvider],
    exports: ['FIREBASE_ADMIN']
})

export class FirebaseModule { }