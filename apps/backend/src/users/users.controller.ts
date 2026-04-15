import { Body, Controller, Get, Post, Put, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, LoginDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from 'src/lib/guards/jwt.guard';
import { PaginationDto } from 'src/group/dto/group.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  async getAllUsers(@Query() query: PaginationDto) {
    return this.usersService.getAllUsers(query)
  }


  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyProfile(@Req() req) {
    return this.usersService.getUserById(req.user.userId);
  }

  @Post('register')
  async createUser(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto);
    return this.usersService.createUser(createUserDto);
  }


  @Post('login')
  async loginUser(@Body() loginDto: LoginDto) {
    console.log(loginDto);
    return this.usersService.loginUser(loginDto.email, loginDto.password);
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

  @Put(':id')
  async updateUser(@Body() updateUserDto: UpdateUserDto, @Param('id') id: string) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
