import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigifyModule } from '@itgorillaz/configify';
import { AppConfig } from 'src/lib/config';
import { CreateUserUseCase } from './usecases/create-user.usecase';
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
  controllers: [UsersController],
  providers: [UsersService, CreateUserUseCase],
})
export class UsersModule { }
