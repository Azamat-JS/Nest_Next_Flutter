import { Module } from '@nestjs/common';
import { HomeworkRepository } from './homework.service';
import { HomeworkController } from './homework.controller';
import { ConfigifyModule } from '@itgorillaz/configify';
import { JwtModule } from '@nestjs/jwt';
import { AppConfig } from 'src/lib/config';
import { PortalAccessService } from 'src/portal/portal-access.service';

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
  controllers: [HomeworkController],
  providers: [HomeworkRepository, PortalAccessService],
})
export class HomeworkModule { }
