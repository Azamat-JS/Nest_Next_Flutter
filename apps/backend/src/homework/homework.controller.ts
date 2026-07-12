import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
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
    create(@Body() dto: CreateHomeworkDto) {
        const { groupId, topic, dueDate } = dto;
        return this.homeworkRepo.create({
            topic,
            dueDate,
            group: { connect: { id: groupId } },
            tenant: { connect: { id: this.tenantContext.getTenantId()! } },
        });
    }
}
