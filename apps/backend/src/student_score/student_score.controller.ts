import { Controller } from '@nestjs/common';
import { StudentScoreRepository } from './student_score.service';

@Controller('student-score')
export class StudentScoreController {
  constructor(private readonly studentScoreService: StudentScoreRepository, private readonly studentScoreRepo: StudentScoreRepository) { }
}
