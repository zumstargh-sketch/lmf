import { Controller, Post, Body, Get } from '@nestjs/common';
import { VolunteersService } from './volunteers.service';

@Controller('volunteers')
export class VolunteersController {
  constructor(private svc: VolunteersService) {}

  @Post('apply')
  async apply(@Body() body: any) {
    return this.svc.apply(body);
  }

  @Get()
  async list() {
    return this.svc.list();
  }
}
