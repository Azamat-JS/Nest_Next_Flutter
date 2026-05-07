import { Body, Delete, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { StudentScoreRepository } from './student_score.service';
import { ScoreDto, UpdateScoreDto } from './dto/score.dto';
import { UpdateScoreUseCase, BulkAddScoreUseCase } from './usecases';
import { BulkScoreDto } from './dto/bulk.dto';
import { PaginationDto } from 'src/lib/shared/dto/pagination.dto';
import { ChartDateDto } from 'src/lib/shared/dto/chart_date.dto';

@Controller('student-score')
export class StudentScoreController {
  constructor(private readonly studentScoreRepo: StudentScoreRepository,
    private readonly updateScoreUseCase: UpdateScoreUseCase,
    private readonly bulkAddScoreUseCase: BulkAddScoreUseCase,
  ) { }

  @Get("all/students/:groupId")
  async getAllStudentsScore(@Param('groupId') groupId: string) {
    return this.studentScoreRepo.getAllStudentsScoreByGroup(groupId);
  }

  @Get("today/students/:groupId")
  async getTodayStudentsScore(@Param('groupId') groupId: string) {
    return this.studentScoreRepo.getTodayStudentsScoreByGroup(groupId);
  }

  @Get('leaderboard')
  async getLeaderboard(@Query() query: PaginationDto) {
    return this.studentScoreRepo.leaderboard(query);
  }

  @Get('leaderboard/:groupId')
  async getGroupLeaderboard(@Query() query: PaginationDto, @Param('groupId') groupId: string) {
    return this.studentScoreRepo.groupLeadeboard(groupId, query);
  }

  @Get('one-student/:studentId/:groupId')
  async getOneStudentScore(
    @Param('studentId') studentId: string,
    @Param('groupId') groupId: string,
    @Query() query: PaginationDto
  ) {
    console.log(groupId);
    return this.studentScoreRepo.findOneStudentScores(studentId, groupId, query);
  }

  @Get('chart/:studentId/:groupId')
  async getScoreHistoryForChart(@Param('studentId') studentId: string, @Param("groupId") groupId: string, @Query() query: ChartDateDto) {
    return this.studentScoreRepo.getScoreHistoryForChart(studentId, groupId, query);
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

  @Delete("delete/all")
  async deleteAll() {
    return this.studentScoreRepo.deleteMany();
  }
}
