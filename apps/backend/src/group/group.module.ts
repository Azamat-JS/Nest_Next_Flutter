import { Module } from '@nestjs/common';
import { GroupRepository } from './group.service';
import { GroupController } from './group.controller';
import { ConfigifyModule } from '@itgorillaz/configify';
import { JwtModule } from '@nestjs/jwt';
import { AppConfig } from 'src/lib/config';
import { AddStudentUseCase, CreateGroupUseCase, RemoveStudentFromGroupUseCase, UpdateGroupUseCase } from './usecases';
import { StudentScoreRepository } from 'src/student_score/student_score.service';
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
  controllers: [GroupController],
  providers: [GroupRepository, CreateGroupUseCase, UpdateGroupUseCase, RemoveStudentFromGroupUseCase, StudentScoreRepository, AddStudentUseCase, PortalAccessService],
})
export class GroupModule { }
