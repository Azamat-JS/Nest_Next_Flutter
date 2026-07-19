import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardStatsQueryDto, PaymentsChartQueryDto } from './dto/dashboard.dto';
import { RolesGuard } from 'src/lib/guards/roles.guard';
import { Roles } from 'src/lib/shared/decorators/roles';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @UseGuards(RolesGuard)
    @Roles('ADMIN', 'TEACHER')
    @Get('stats')
    getStats(@Query() query: DashboardStatsQueryDto) {
        return this.dashboardService.getStats(query);
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN', 'TEACHER')
    @Get('payments-chart')
    getPaymentsChart(@Query() query: PaymentsChartQueryDto) {
        return this.dashboardService.getPaymentsChart(query);
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN', 'TEACHER')
    @Get('schedule')
    getSchedule() {
        return this.dashboardService.getSchedule();
    }
}
