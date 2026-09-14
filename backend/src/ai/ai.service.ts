import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AIService {
  constructor(private prisma: PrismaService) {}

  async search(query: string, language = 'en') {
    // Simple keyword search on title and content stored in AIKnowledge
    return this.prisma.aIKnowledge.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } }
        ],
        language
      },
      take: 10
    });
  }

  async answer(query: string, language = 'en') {
    const results = await this.search(query, language);
    if (!results || results.length === 0) {
      return null;
    }
    // Return the most relevant content (first match)
    return results[0];
  }
}
