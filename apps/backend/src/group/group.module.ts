import { Module } from '@nestjs/common';
import { GroupRepository } from './group.service';
import { GroupController } from './group.controller';
import { ConfigifyModule } from '@itgorillaz/configify';
import { JwtModule } from '@nestjs/jwt';
import { AppConfig } from 'src/lib/config';
import { CreateGroupUseCase } from './usecases';

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
  providers: [GroupRepository, CreateGroupUseCase],
})
export class GroupModule { }
