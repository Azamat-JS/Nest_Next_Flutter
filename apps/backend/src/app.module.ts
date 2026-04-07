import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ChatModule } from './chat/chat.module';
import { UsersModule } from './users/users.module';
import { ConfigifyModule } from '@itgorillaz/configify';
import { GroupModule } from './group/group.module';


@Module({
  imports: [
    ConfigifyModule.forRootAsync(),
    PrismaModule,
    ChatModule,
    UsersModule,
    GroupModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
