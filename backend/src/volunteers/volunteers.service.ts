import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VolunteersService {
  constructor(private prisma: PrismaService) {}

  async apply(data: any) {
    return this.prisma.volunteer.create({ data: { ...data, status: 'PENDING' } });
  }

  async list() {
    return this.prisma.volunteer.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
