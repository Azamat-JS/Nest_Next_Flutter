import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { HomeworkRepository } from "./homework.service";
import { CreateHomeworkDto, HomeworkQueryDto } from "./dto/homework.dto";
import { TenantContextService } from "src/lib/tenant/tenant-context.service";
import { RolesGuard } from "src/lib/guards/roles.guard";
import { Roles } from "src/lib/shared/decorators/roles";

@Controller('homework')
export class HomeworkController {
    constructor(
        private readonly homeworkRepo: HomeworkRepository,
        private readonly tenantContext: TenantContextService,
    ) { }

    @UseGuards(RolesGuard)
    @Roles('ADMIN', 'TEACHER')
    @Get('group/:groupId')
    findByGroup(@Param('groupId') groupId: string, @Query() query: HomeworkQueryDto) {
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
