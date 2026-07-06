import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ClsModule } from 'nestjs-cls';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ConfigifyModule } from '@itgorillaz/configify';
import { GroupModule } from './group/group.module';
import { StudentScoreModule } from './student_score/student_score.module';
import { StudentPaymentModule } from './student_payment/student_payment.module';
import { PlatformAdminModule } from './platform-admin/platform-admin.module';
import { TenantModule } from './lib/tenant/tenant.module';
import { JwtAuthGuard } from './lib/guards/jwt.guard';
import { AppConfig } from './lib/config';


@Module({
  imports: [
    ClsModule.forRoot({ global: true, middleware: { mount: true } }),
    ConfigifyModule.forRootAsync(),
    JwtModule.registerAsync({
      inject: [AppConfig],
      useFactory: (config: AppConfig) => ({
        secret: config.JWT_SECRET,
        signOptions: { expiresIn: config.JWT_EXPIRES_IN },
      })
    }),
    TenantModule,
    PrismaModule,
    UsersModule,
    GroupModule,
    StudentScoreModule,
    StudentPaymentModule,
    PlatformAdminModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule { }
