import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (user) {
      // hide sensitive fields
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = user as any;
      return rest;
    }
    return { message: 'Not found' };
  }
}
