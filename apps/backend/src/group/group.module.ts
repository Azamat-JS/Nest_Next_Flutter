import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { ConfigifyModule } from '@itgorillaz/configify';
import { JwtModule } from '@nestjs/jwt';
import { AppConfig } from 'src/lib/config';

@Module({
  imports: [
    ConfigifyModule.forRootAsync(),
    JwtModule.registerAsync({
      inject: [AppConfig],
      useFactory: (config: AppConfig) => ({
        secret: config.JWT_SECRET,
        signOptions: { expiresIn: config.JWT_EXPIRES_IN },
      })
    }),
  ],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule { }
