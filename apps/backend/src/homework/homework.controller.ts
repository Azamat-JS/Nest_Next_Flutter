import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { HomeworkRepository } from "./homework.service";
import { CreateHomeworkDto, HomeworkQueryDto } from "./dto/homework.dto";
import { TenantContextService } from "src/lib/tenant/tenant-context.service";
import { RolesGuard } from "src/lib/guards/roles.guard";
import { Roles } from "src/lib/shared/decorators/roles";
import { PortalAccessService } from "src/portal/portal-access.service";

@Controller('homework')
export class HomeworkController {
    constructor(
        private readonly homeworkRepo: HomeworkRepository,
        private readonly tenantContext: TenantContextService,
        private readonly portalAccess: PortalAccessService,
    ) { }

    @UseGuards(RolesGuard)
    @Roles('ADMIN', 'TEACHER', 'STUDENT')
    @Get('group/:groupId')
    async findByGroup(@Req() req, @Param('groupId') groupId: string, @Query() query: HomeworkQueryDto) {
        if (req.user.role === 'STUDENT') {
            await this.portalAccess.assertCanViewGroup(req.user, groupId);
        }
        return this.homeworkRepo.findByGroup(groupId, query);
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN', 'TEACHER')
    @Post()
    async create(@Body() dto: CreateHomeworkDto) {
        const { groupId, topic, dueDate, lessonDate } = dto;
        if (lessonDate) {
            await this.assertValidLessonDate(groupId, lessonDate);
        }
        return this.homeworkRepo.create({
            topic,
            dueDate,
            ...(lessonDate && { lessonDate }),
            group: { connect: { id: groupId } },
            tenant: { connect: { id: this.tenantContext.getTenantId()! } },
        });
    }

    // The lesson day must be one of the group's scheduled weekdays (any
    // weekday if the group has no schedule configured) and fall within the
    // current or previous ISO week. Dates arrive as "yyyy-MM-dd" (UTC
    // midnight), so all calendar math here is done in UTC.
    private async assertValidLessonDate(groupId: string, lessonDate: Date) {
        const scheduleDays = await this.homeworkRepo.findGroupScheduleDays(groupId);
        const isoDay = lessonDate.getUTCDay() === 0 ? 7 : lessonDate.getUTCDay();
        if (scheduleDays.length > 0 && !scheduleDays.includes(isoDay)) {
            throw new BadRequestException('lessonDate is not one of the group\'s scheduled lesson days');
        }

        const today = new Date();
        const todayUtcMidnight = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
        const todayIsoDay = today.getUTCDay() === 0 ? 7 : today.getUTCDay();
        const mondayThisWeek = todayUtcMidnight - (todayIsoDay - 1) * 86400000;
        const mondayPreviousWeek = mondayThisWeek - 7 * 86400000;
        const nextMonday = mondayThisWeek + 7 * 86400000;
        const ts = lessonDate.getTime();
        if (ts < mondayPreviousWeek || ts >= nextMonday) {
            throw new BadRequestException('lessonDate must be within the current or previous week');
        }
    }
}
