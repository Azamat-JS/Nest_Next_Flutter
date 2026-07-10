import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PlatformRoute } from 'src/lib/shared/decorators/platform-route';
import { PlatformAdminGuard } from 'src/lib/guards/platform-admin.guard';
import { PlatformAdminService } from './platform-admin.service';
import { CreateTenantDto, PlatformAdminLoginDto, SetTenantBotDto, UpdateTenantStatusDto } from './dto/platform-admin.dto';

@PlatformRoute()
@Controller('platform-admin')
export class PlatformAdminController {
    constructor(private readonly platformAdminService: PlatformAdminService) { }

    @Post('login')
    async login(@Body() dto: PlatformAdminLoginDto) {
        return this.platformAdminService.login(dto);
    }

    @UseGuards(PlatformAdminGuard)
    @Post('tenants')
    async createTenant(@Body() dto: CreateTenantDto) {
        return this.platformAdminService.createTenant(dto);
    }

    @UseGuards(PlatformAdminGuard)
    @Get('tenants')
    async listTenants() {
        return this.platformAdminService.listTenants();
    }

    @UseGuards(PlatformAdminGuard)
    @Patch('tenants/:id/status')
    async updateTenantStatus(@Param('id') id: string, @Body() dto: UpdateTenantStatusDto) {
        return this.platformAdminService.updateTenantStatus(id, dto);
    }

    @UseGuards(PlatformAdminGuard)
    @Patch('tenants/:id/bot')
    async setTenantBot(@Param('id') id: string, @Body() dto: SetTenantBotDto) {
        return this.platformAdminService.setTenantBot(id, dto);
    }

    @UseGuards(PlatformAdminGuard)
    @Delete('tenants/:id')
    async deleteTenant(@Param('id') id: string) {
        return this.platformAdminService.deleteTenant(id);
    }

    @UseGuards(PlatformAdminGuard)
    @Delete('tenants/:id/purge')
    async purgeTenant(@Param('id') id: string) {
        return this.platformAdminService.purgeTenant(id);
    }
}
