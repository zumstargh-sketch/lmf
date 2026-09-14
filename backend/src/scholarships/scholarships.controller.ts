import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ScholarshipsService } from './scholarships.service';

@Controller('scholarships')
export class ScholarshipsController {
  constructor(private svc: ScholarshipsService) {}

  @Get()
  async list() {
    return this.svc.list();
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.svc.get(id);
  }

  @Post(':id/apply')
  async apply(@Param('id') id: string, @Body() body: any) {
    return this.svc.apply(id, body);
  }
}
