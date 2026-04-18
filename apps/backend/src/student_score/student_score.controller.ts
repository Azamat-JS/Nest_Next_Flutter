import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { StudentScoreRepository } from './student_score.service';
import { ScoreDto } from './dto/score.dto';
import { AddScoreUseCase, UpdateScoreUseCase } from './usecases';

@Controller('student-score')
export class StudentScoreController {
  constructor(private readonly studentScoreRepo: StudentScoreRepository, private readonly addScoreUseCase: AddScoreUseCase,
    private readonly updateScoreUseCase: UpdateScoreUseCase,
  ) { }

  @Get("total/:studentId/:groupId")
  async getTotalScore(@Param('studentId') studentId: string, @Param('groupId') groupId: string) {
    return this.studentScoreRepo.findTotalScoreByStudentAndGroup(studentId, groupId);
  }

  @Get("attendance/:studentId/:groupId")
  async getAttendance(@Param('studentId') studentId: string, @Param('groupId') groupId: string) {
    return this.studentScoreRepo.findTodayAttendance(studentId, groupId);
  }

  @Post("add")
  async addScore(@Body() body: ScoreDto) {
    return this.addScoreUseCase.execute(body);
  }

  @Put("update/:eventId")
  async updateScore(
    @Param('eventId') eventId: string,
    @Body() body: ScoreDto,
  ) {
    return this.updateScoreUseCase.execute(
      body,
      eventId,
    );
  }
}
