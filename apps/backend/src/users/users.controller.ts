import { Body, Controller, Get, Post, Put, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  async getAllUsers() {
    return this.usersService.getAllUsers()
  }

  @Post('register')
  async createUser(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto)
    return this.usersService.createUser(createUserDto);
  }


  @Post('login')
  async loginUser(@Body() loginDto: { email: string, password: string }) {
    console.log(loginDto)
    return this.usersService.loginUser(loginDto.email, loginDto.password);
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
