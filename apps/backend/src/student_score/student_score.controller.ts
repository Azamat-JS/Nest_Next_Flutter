import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { StudentScoreRepository } from './student_score.service';
import { ScoreDto } from './dto/score.dto';
import { AddScoreUseCase, UpdateScoreUseCase, BulkAddScoreUseCase } from './usecases';
import { BulkScoreDto } from './dto/bulk.dto';

@Controller('student-score')
export class StudentScoreController {
  constructor(private readonly studentScoreRepo: StudentScoreRepository, private readonly addScoreUseCase: AddScoreUseCase,
    private readonly updateScoreUseCase: UpdateScoreUseCase,
    private readonly bulkAddScoreUseCase: BulkAddScoreUseCase,
  ) { }

  @Get("all/students/:groupId")
  async getAllStudentsScore(@Param('groupId') groupId: string) {
    return this.studentScoreRepo.getAllStudentsScoreByGroup(groupId);
  }

  @Get("today/students/:groupId")
  async findTodayScore(@Param('groupId') groupId: string, @Param('studentId') studentId: string) {
    return this.studentScoreRepo.findTodayScore(studentId, groupId);
  }

  // @Get("group/scores/:groupId")
  // async getTotalScore(@Param('groupId') groupId: string) {
  //   return this.studentScoreRepo.findAllScoresByGroup(groupId);
  // }

  @Post("add")
  async addScore(@Body() body: ScoreDto) {
    return this.addScoreUseCase.execute(body);
  }

  @Post("bulk")
  async bulkAddScores(@Body() body: BulkScoreDto) {
    return this.bulkAddScoreUseCase.execute(body);
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
