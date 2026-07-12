import { Body, Delete, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { StudentScoreRepository } from './student_score.service';
import { ScoreDto, UpdateScoreDto } from './dto/score.dto';
import { UpdateScoreUseCase, BulkAddScoreUseCase } from './usecases';
import { BulkScoreDto } from './dto/bulk.dto';
import { PaginationDto } from 'src/lib/shared/dto/pagination.dto';
import { ChartDateDto } from 'src/lib/shared/dto/chart_date.dto';
import { Roles } from 'src/lib/shared/decorators/roles';
import { RolesGuard } from 'src/lib/guards/roles.guard';
import { PortalAccessService } from 'src/portal/portal-access.service';

@Controller('student-score')
export class StudentScoreController {
  constructor(private readonly studentScoreRepo: StudentScoreRepository,
    private readonly updateScoreUseCase: UpdateScoreUseCase,
    private readonly bulkAddScoreUseCase: BulkAddScoreUseCase,
    private readonly portalAccess: PortalAccessService,
  ) { }

  @Get("all/students/:groupId")
  async getAllStudentsScore(@Req() req, @Param('groupId') groupId: string) {
    if (req.user.role === 'STUDENT') {
      await this.portalAccess.assertCanViewGroup(req.user, groupId);
    }
    return this.studentScoreRepo.getAllStudentsScoreByGroup(groupId);
  }

  @Get("today/students/:groupId")
  async getTodayStudentsScore(@Req() req, @Param('groupId') groupId: string) {
    if (req.user.role === 'STUDENT') {
      await this.portalAccess.assertCanViewGroup(req.user, groupId);
    }
    return this.studentScoreRepo.getTodayStudentsScoreByGroup(groupId);
  }

  @Get('leaderboard')
  async getLeaderboard(@Query() query: PaginationDto) {
    return this.studentScoreRepo.leaderboard(query);
  }

  @Get('leaderboard/:groupId')
  async getGroupLeaderboard(@Req() req, @Query() query: PaginationDto, @Param('groupId') groupId: string) {
    if (req.user.role === 'STUDENT') {
      await this.portalAccess.assertCanViewGroup(req.user, groupId);
    }
    return this.studentScoreRepo.groupLeadeboard(groupId, query);
  }

  @Get('one-student/:studentId/:groupId')
  async getOneStudentScore(
    @Req() req,
    @Param('studentId') studentId: string,
    @Param('groupId') groupId: string,
    @Query() query: PaginationDto
  ) {
    if (req.user.role === 'STUDENT') {
      await this.portalAccess.assertCanViewStudent(req.user, studentId);
    }
    return this.studentScoreRepo.findOneStudentScores(studentId, groupId, query);
  }

  @Get('one-student/grouped/:studentId/:groupId')
  async getOneStudentScoreGrouped(
    @Req() req,
    @Param('studentId') studentId: string,
    @Param('groupId') groupId: string,
    @Query() query: PaginationDto
  ) {
    if (req.user.role === 'STUDENT') {
      await this.portalAccess.assertCanViewStudent(req.user, studentId);
    }
    return this.studentScoreRepo.findOneStudentScoresGrouped(studentId, groupId, query);
  }

  @Get('chart/:studentId/:groupId')
  async getScoreHistoryForChart(@Req() req, @Param('studentId') studentId: string, @Param("groupId") groupId: string, @Query() query: ChartDateDto) {
    if (req.user.role === 'STUDENT') {
      await this.portalAccess.assertCanViewStudent(req.user, studentId);
    }
    return this.studentScoreRepo.getScoreHistoryForChart(studentId, groupId, query);
  }

  @Get('group-chart/:groupId')
  async getGroupTotalAvgScores(@Req() req, @Param('groupId') groupId: string, @Query() query: { year: number }) {
    if (req.user.role === 'STUDENT') {
      await this.portalAccess.assertCanViewGroup(req.user, groupId);
    }
    return this.studentScoreRepo.getGroupTotalAvgScores(groupId, query.year);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  @Post("bulk")
  async bulkAddScores(@Body() body: BulkScoreDto) {
    return this.bulkAddScoreUseCase.execute(body);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TEACHER')
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

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete("delete/all")
  async deleteAll() {
    return this.studentScoreRepo.deleteMany();
  }
}
