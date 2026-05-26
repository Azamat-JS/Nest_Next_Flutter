import { Module } from '@nestjs/common';
import { StudentPaymentService } from './student_payment.service';
import { StudentPaymentController } from './student_payment.controller';
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
  controllers: [StudentPaymentController],
  providers: [StudentPaymentService],
})
export class StudentPaymentModule { }
