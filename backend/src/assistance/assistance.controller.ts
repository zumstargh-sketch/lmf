import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AssistanceService } from './assistance.service';

@Controller('assistance')
export class AssistanceController {
  constructor(private svc: AssistanceService) {}

  @Post()
  async create(@Body() body: any) {
    // expect fullName, phone, email, region, district, category, description, emergency
    const rec = await this.svc.createCase(body);
    return { id: rec.id, reference: rec.reference, status: rec.status };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.svc.getCase(id);
  }

  @Get()
  async list() {
    return this.svc.list();
  }
}
