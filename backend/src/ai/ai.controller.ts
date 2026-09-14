import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, NotFoundException, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

export class KnowledgeDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  language?: string;
}

@Controller('ai')
export class AIController {
  constructor(
    private svc: AIService,
    private prisma: PrismaService
  ) {}

  /** Floating assistant: ask anything about the foundation. */
  @Post('ask')
  async ask(@Body('question') question: string) {
    return this.svc.ask(question || '');
  }

  /** Example questions shown as quick taps in the assistant. */
  @Get('suggestions')
  async suggestions() {
    return this.svc.suggestions();
  }

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

  // ── Knowledge base management (admin dashboard) ──────────────────────────

  /** Only SUPER_ADMIN / ADMIN accounts may manage the knowledge base. */
  private async assertAdmin(req: Request & { user?: any }) {
    const payload = req.user;
    if (!payload?.sub) {
      throw new ForbiddenException('Admin access required.');
    }
    const adminRoles = await this.prisma.role.findMany({
      where: { name: { in: ['SUPER_ADMIN', 'ADMIN'] } }
    });
    if (!adminRoles.some((role) => role.id === payload.roleId)) {
      throw new ForbiddenException('Admin access required.');
    }
  }

  @Get('knowledge')
  @UseGuards(JwtAuthGuard)
  async listKnowledge(@Req() req: Request) {
    await this.assertAdmin(req as Request & { user: any });
    return this.prisma.aIKnowledge.findMany({
      where: { language: 'en' },
      orderBy: { createdAt: 'asc' }
    });
  }

  @Post('knowledge')
  @UseGuards(JwtAuthGuard)
  async createKnowledge(@Req() req: Request, @Body() dto: KnowledgeDto) {
    await this.assertAdmin(req as Request & { user: any });
    if (!dto.title?.trim() || !dto.content?.trim()) {
      throw new BadRequestException('Title and answer are required.');
    }
    return this.prisma.aIKnowledge.create({
      data: {
        title: dto.title.trim(),
        content: dto.content.trim(),
        language: dto.language?.trim() || 'en'
      }
    });
  }

  @Put('knowledge/:id')
  @UseGuards(JwtAuthGuard)
  async updateKnowledge(@Req() req: Request, @Param('id') id: string, @Body() dto: KnowledgeDto) {
    await this.assertAdmin(req as Request & { user: any });
    const existing = await this.prisma.aIKnowledge.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Knowledge entry not found.');
    }
    return this.prisma.aIKnowledge.update({
      where: { id },
      data: {
        title: dto.title?.trim() || existing.title,
        content: dto.content?.trim() || existing.content
      }
    });
  }

  @Delete('knowledge/:id')
  @UseGuards(JwtAuthGuard)
  async deleteKnowledge(@Req() req: Request, @Param('id') id: string) {
    await this.assertAdmin(req as Request & { user: any });
    const existing = await this.prisma.aIKnowledge.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Knowledge entry not found.');
    }
    await this.prisma.aIKnowledge.delete({ where: { id } });
    return { deleted: true };
  }
}
