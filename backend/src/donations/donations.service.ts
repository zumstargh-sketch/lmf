import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Decoded JWT payload of the signed-in donor. */
interface DonorPayload {
  sub?: string;
  email?: string;
  name?: string;
}

@Injectable()
export class DonationsService {
  constructor(private prisma: PrismaService) {}

  /** Creates a PENDING donation tied to the signed-in donor. */
  async createDonation(data: any, donor?: DonorPayload) {
    const amount = Number(data?.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Enter a valid donation amount.');
    }
    const reference = `DN-${Date.now()}`;
    const rec = await this.prisma.donation.create({
      data: {
        reference,
        donorId: donor?.sub,
        donorName: donor?.name ?? data?.donorName ?? null,
        email: donor?.email ?? data?.email ?? null,
        phone: data?.phone ?? null,
        amount,
        currency: data?.currency || 'GHS',
        projectId: data?.projectId || null,
        status: 'PENDING'
      }
    });
    // In production, call Paystack to initialize transaction and return payment_url
    return { donation: rec, payment_url: null };
  }

  async get(id: string) {
    return this.prisma.donation.findUnique({ where: { id } });
  }
}