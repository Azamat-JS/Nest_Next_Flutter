import { Body, Delete, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { StudentScoreRepository } from './student_score.service';
import { ScoreDto, UpdateScoreDto } from './dto/score.dto';
import { AddScoreUseCase, UpdateScoreUseCase, BulkAddScoreUseCase } from './usecases';
import { BulkScoreDto } from './dto/bulk.dto';
import { RemoveStudentFromGroupUseCase } from './usecases/remove_student_from_group_usecase';

@Controller('student-score')
export class StudentScoreController {
  constructor(private readonly studentScoreRepo: StudentScoreRepository, private readonly addScoreUseCase: AddScoreUseCase,
    private readonly updateScoreUseCase: UpdateScoreUseCase,
    private readonly bulkAddScoreUseCase: BulkAddScoreUseCase,
    private readonly removeStudentFromGroupUseCase: RemoveStudentFromGroupUseCase
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

  @Put("update/:studentId/:groupId")
  async updateScore(
    @Param('studentId') studentId: string,
    @Param('groupId') groupId: string,
    @Body() dto: UpdateScoreDto,
  ) {
    return this.updateScoreUseCase.execute(
      dto,
      studentId,
      groupId
    );
  }

  @Delete("delete/:studentId/:groupId")
  async deleteStudent(@Param('studentId') studentId: string, @Param('groupId') groupId: string) {
    return this.removeStudentFromGroupUseCase.execute(studentId, groupId);
  }

  @Delete("delete/all")
  async deleteAll() {
    return this.studentScoreRepo.deleteMany();
  }
}
