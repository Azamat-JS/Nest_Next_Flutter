import { Body, Controller, Get, Post, Put, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { ChangePasswordDto, CreateUserDto, GetUsersQueryDto, LoginDto, UpdateUserDto } from './dto/user.dto';
import { Roles } from 'src/lib/shared/decorators/roles';
import { RolesGuard } from 'src/lib/guards/roles.guard';
import { Public } from 'src/lib/shared/decorators/public';
import { AllowPendingPasswordChange } from 'src/lib/shared/decorators/allow-pending-password-change';
import { CreateUserUseCase } from './usecases/create-user.usecase';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly createUserUseCase: CreateUserUseCase,
  ) { }

  @Get()
  async getAllUsers(@Query() query: GetUsersQueryDto) {
    return this.usersService.getAllUsers(query)
  }

  @Get('me')
  async getMyProfile(@Req() req) {
    return this.usersService.getUserById(req.user.userId);
  }

  @AllowPendingPasswordChange()
  @Put('me/password')
  async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.userId, dto);
  }

  @Post('device-token')
  async indentifyDevice(@Body() token: string) {
    return this.usersService.indentifyDevice(token);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  @Post()
  async createUser(@Req() req, @Body() createUserDto: CreateUserDto) {
    return this.createUserUseCase.execute(createUserDto, req.user.role);
  }

  @Public()
  @Post('login')
  async loginUser(@Body() loginDto: LoginDto) {
    return this.usersService.loginUser(loginDto);
  }

  @Public()
  @Post('refresh-token')
  async updateAccessToken(@Body('refreshToken') oldRefreshToken: string) {
    return this.usersService.updateAccessToken(oldRefreshToken);
  }

  @Get('teachers')
  async getAllTeachers() {
    return this.usersService.getAllTeachers();
  }

  @Get('students')
  async getAllStudents() {
    return this.usersService.getAllStudents();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  @Put(':id')
  async updateUser(@Body() updateUserDto: UpdateUserDto, @Param('id') id: string) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
