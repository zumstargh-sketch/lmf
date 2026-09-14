import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const [activeProjects, openAssistanceCases, scholarshipApplicants, donationTotal] = await Promise.all([
      this.prisma.project.count({ where: { status: 'active' } }),
      this.prisma.assistanceCase.count({ where: { status: { not: 'closed' } } }),
      this.prisma.scholarshipApplication.count(),
      this.prisma.donation.aggregate({
        _sum: { amount: true },
        where: { status: 'completed' }
      })
    ]);

    return {
      activeProjects,
      openAssistanceCases,
      scholarshipApplicants,
      donationTotal: donationTotal._sum.amount ?? 0
    };
  }
}
