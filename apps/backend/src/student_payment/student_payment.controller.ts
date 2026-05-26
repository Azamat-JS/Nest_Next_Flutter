import { Controller } from '@nestjs/common';
import { StudentPaymentService } from './student_payment.service';

@Controller('student-payment')
export class StudentPaymentController {
  constructor(private readonly studentPaymentService: StudentPaymentService) {}
}
