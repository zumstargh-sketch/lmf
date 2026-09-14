import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScholarshipsService {
  constructor(private prisma: PrismaService) {}

  async list() {
    return this.prisma.scholarship.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async get(id: string) {
    return this.prisma.scholarship.findUnique({ where: { id }, include: { applications: true } });
  }

  async apply(scholarshipId: string, data: any) {
    return this.prisma.scholarshipApplication.create({ data: { scholarshipId, ...data, status: 'SUBMITTED' } });
  }
}
