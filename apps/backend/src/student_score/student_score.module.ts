import { Module } from '@nestjs/common';
import { StudentScoreRepository } from './student_score.service';
import { StudentScoreController } from './student_score.controller';
import { ConfigifyModule } from '@itgorillaz/configify';
import { JwtModule } from '@nestjs/jwt';
import { AppConfig } from 'src/lib/config';
import { AddScoreUseCase, UpdateScoreUseCase } from './usecases';

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
  controllers: [StudentScoreController],
  providers: [StudentScoreRepository, AddScoreUseCase, UpdateScoreUseCase],
})
export class StudentScoreModule { }
