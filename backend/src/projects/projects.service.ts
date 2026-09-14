import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.project.create({
      data: {
        title: data.title,
        category: data.category,
        region: data.region,
        description: data.description,
        status: data.status || 'draft',
        beneficiaries: data.beneficiaries ? Number(data.beneficiaries) : undefined
      }
    });
  }

  async list(filter?: { region?: string; category?: string }) {
    const where: any = {};
    if (filter?.region) where.region = filter.region;
    if (filter?.category) where.category = filter.category;
    return this.prisma.project.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async get(id: string) {
    return this.prisma.project.findUnique({ where: { id }, include: { media: true } });
  }
}
