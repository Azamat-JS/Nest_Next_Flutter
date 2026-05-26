import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ChatModule } from './chat/chat.module';
import { UsersModule } from './users/users.module';
import { ConfigifyModule } from '@itgorillaz/configify';
import { GroupModule } from './group/group.module';
import { StudentScoreModule } from './student_score/student_score.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { FirebaseModule } from './lib/firebase/firebase.module';
import { StudentPaymentModule } from './student_payment/student_payment.module';


@Module({
  imports: [
    ConfigifyModule.forRootAsync(),
    PrismaModule,
    EventEmitterModule.forRoot(),
    FirebaseModule,
    ChatModule,
    UsersModule,
    GroupModule,
    StudentScoreModule,
    StudentPaymentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
