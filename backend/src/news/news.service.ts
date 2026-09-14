import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  async latest(limit = 10) {
    return this.prisma.news.findMany({ orderBy: { createdAt: 'desc' }, take: limit });
  }

  async getBySlug(slug: string) {
    return this.prisma.news.findUnique({ where: { slug } });
  }
}
