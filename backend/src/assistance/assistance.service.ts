import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssistanceService {
  constructor(private prisma: PrismaService) {}

  private generateReference() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rnd = Math.floor(1000 + Math.random() * 9000);
    return `ASF-${y}${m}${d}-${rnd}`;
  }

  async createCase(data: any) {
    const reference = this.generateReference();
    const rec = await this.prisma.assistanceCase.create({ data: { reference, ...data } });
    return rec;
  }

  async getCase(id: string) {
    return this.prisma.assistanceCase.findUnique({ where: { id }, include: { documents: true } });
  }

  async list(filter?: any) {
    return this.prisma.assistanceCase.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
