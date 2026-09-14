import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { AIService } from './ai.service';

@Controller('ai')
export class AIController {
  constructor(private svc: AIService) {}

  @Get('search')
  async search(@Query('q') q: string, @Query('lang') lang: string) {
    return this.svc.search(q, lang || 'en');
  }

  @Post('answer')
  async answer(@Body('q') q: string, @Body('lang') lang: string) {
    const res = await this.svc.answer(q, lang || 'en');
    if (!res) return { answer: null, message: "I don't have verified information about that. Please contact the Lordina Foundation directly." };
    return { answer: res.content, source: res.title };
  }
}
