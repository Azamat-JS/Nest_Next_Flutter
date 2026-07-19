import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateBranchDto, UpdateBranchDto, UpdateOrganizationDto } from './dto/organization.dto';
import { RolesGuard } from 'src/lib/guards/roles.guard';
import { Roles } from 'src/lib/shared/decorators/roles';

@Controller('organization')
export class OrganizationController {
    constructor(private readonly organizationService: OrganizationService) { }

    // Any authenticated user: the header shows the organization name and logo.
    @Get()
    getSettings() {
        return this.organizationService.getSettings();
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Patch()
    updateSettings(@Body() dto: UpdateOrganizationDto) {
        return this.organizationService.updateSettings(dto);
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Get('branches')
    findAllBranches() {
        return this.organizationService.findAllBranches();
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Post('branches')
    createBranch(@Body() dto: CreateBranchDto) {
        return this.organizationService.createBranch(dto);
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Put('branches/:id')
    updateBranch(@Param('id') id: string, @Body() dto: UpdateBranchDto) {
        return this.organizationService.updateBranch(id, dto);
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Delete('branches/:id')
    removeBranch(@Param('id') id: string) {
        return this.organizationService.removeBranch(id);
    }
}
