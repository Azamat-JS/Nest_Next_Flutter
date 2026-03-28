import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  async getAllUsers() {
    return this.usersService.getAllUsers()
  }

  @Post()
  async createUser(@Body() createUserDto: { username: string, email: string, password: string }) {
    return this.usersService.createUser(createUserDto);
  }
}
