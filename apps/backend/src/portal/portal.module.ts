import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigifyModule } from '@itgorillaz/configify';
import { AppConfig } from 'src/lib/config';
import { GroupRepository } from 'src/group/group.service';
import { StudentScoreRepository } from 'src/student_score/student_score.service';
import { HomeworkRepository } from 'src/homework/homework.service';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';
import { PortalAccessService } from './portal-access.service';

@Module({
    imports: [
        ConfigifyModule.forRootAsync(),
        JwtModule.registerAsync({
            inject: [AppConfig],
            useFactory: (config: AppConfig) => ({
                secret: config.JWT_SECRET,
                signOptions: { expiresIn: config.JWT_EXPIRES_IN },
            }),
        }),
    ],
    controllers: [PortalController],
    providers: [PortalService, PortalAccessService, GroupRepository, StudentScoreRepository, HomeworkRepository],
})
export class PortalModule { }
