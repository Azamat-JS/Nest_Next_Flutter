import { Controller } from '@nestjs/common';
import { StudentScoreService } from './student_score.service';

@Controller('student-score')
export class StudentScoreController {
  constructor(private readonly studentScoreService: StudentScoreService) {}
}
