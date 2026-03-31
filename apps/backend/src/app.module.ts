import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ChatModule } from './chat/chat.module';
import { UsersModule } from './users/users.module';
import { ConfigifyModule } from '@itgorillaz/configify';


@Module({
  imports: [
    ConfigifyModule.forRootAsync(),
    PrismaModule,
    ChatModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
