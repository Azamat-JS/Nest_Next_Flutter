import { Module } from '@nestjs/common';
import { StudentPaymentService } from './student_payment.service';
import { StudentPaymentController } from './student_payment.controller';

@Module({
  controllers: [StudentPaymentController],
  providers: [StudentPaymentService],
})
export class StudentPaymentModule {}
