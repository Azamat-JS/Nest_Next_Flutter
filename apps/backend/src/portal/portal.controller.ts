import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/lib/guards/roles.guard';
import { Roles } from 'src/lib/shared/decorators/roles';
import { PaginationDto } from 'src/lib/shared/dto/pagination.dto';
import { ChartDateDto } from 'src/lib/shared/dto/chart_date.dto';
import { HomeworkQueryDto } from 'src/homework/dto/homework.dto';
import { PortalService } from './portal.service';

// Read-only API for the Telegram mini app. Row-level scoping (own data /
// own children only) is enforced in PortalService via PortalAccessService.
@UseGuards(RolesGuard)
@Roles('PARENT', 'STUDENT', 'ADMIN', 'TEACHER')
@Controller('portal')
export class PortalController {
    constructor(private readonly portalService: PortalService) { }

    @Get('bootstrap')
    async bootstrap(@Req() req) {
        return this.portalService.bootstrap(req.user);
    }

    @Get('groups/:groupId')
    async groupDetails(@Req() req, @Param('groupId') groupId: string, @Query() query: PaginationDto) {
        return this.portalService.getGroupDetails(req.user, groupId, query);
    }

    @Get('groups/:groupId/homework')
    async groupHomework(@Req() req, @Param('groupId') groupId: string, @Query() query: HomeworkQueryDto) {
        return this.portalService.getGroupHomework(req.user, groupId, query);
    }

    @Get('groups/:groupId/leaderboard')
    async groupLeaderboard(@Req() req, @Param('groupId') groupId: string, @Query() query: PaginationDto) {
        return this.portalService.getGroupLeaderboard(req.user, groupId, query);
    }

    @Get('leaderboard')
    async globalLeaderboard(@Query() query: PaginationDto) {
        return this.portalService.getGlobalLeaderboard(query);
    }

    @Get('payments')
    async payments(@Req() req, @Query() query: PaginationDto) {
        return this.portalService.getPayments(req.user, query);
    }

    @Get('scores/:studentId/:groupId')
    async studentScores(
        @Req() req,
        @Param('studentId') studentId: string,
        @Param('groupId') groupId: string,
        @Query() query: PaginationDto,
    ) {
        return this.portalService.getStudentScores(req.user, studentId, groupId, query);
    }

    @Get('chart/:studentId/:groupId')
    async studentScoreChart(
        @Req() req,
        @Param('studentId') studentId: string,
        @Param('groupId') groupId: string,
        @Query() query: ChartDateDto,
    ) {
        return this.portalService.getStudentScoreChart(req.user, studentId, groupId, query);
    }
}
