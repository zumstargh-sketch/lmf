import { Controller, Get, Param } from '@nestjs/common';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private newsService: NewsService) {}

  @Get('latest')
  async latest() {
    return this.newsService.latest();
  }

  @Get('slug/:slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.newsService.getBySlug(slug);
  }
}
