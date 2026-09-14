import { Controller, Get, Query, Param, Post, Body } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  async create(@Body() body: any) {
    return this.projectsService.create(body);
  }

  @Get()
  async list(@Query('region') region: string, @Query('category') category: string) {
    return this.projectsService.list({ region, category });
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.projectsService.get(id);
  }
}
