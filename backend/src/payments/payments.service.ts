import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private logger = new Logger(PaymentsService.name);
  private paystackSecret = process.env.PAYSTACK_SECRET || '';

  constructor(private prisma: PrismaService) {}

  async initializePaystackTransaction(donation: any) {
    const url = 'https://api.paystack.co/transaction/initialize';
    const payload = {
      email: donation.email || 'donor@example.com',
      amount: Math.round((donation.amount || 0) * 100),
      reference: donation.reference,
      currency: donation.currency || 'GHS',
      metadata: { projectId: donation.projectId }
    };
    try {
      const resp = await axios.post(url, payload, { headers: { Authorization: `Bearer ${this.paystackSecret}` } });
      return resp.data;
    } catch (err) {
      this.logger.error('Paystack initialize error', err as any);
      throw err;
    }
  }

  async handleWebhook(event: any) {
    // basic handling: update donation status when transaction.success
    try {
      const evt = event;
      if (evt.event === 'charge.success' || (evt.event === 'transaction.success')) {
        const reference = evt.data.reference || evt.data?.transaction?.reference;
        if (reference) {
          await this.prisma.donation.updateMany({ where: { reference }, data: { status: 'SUCCESSFUL' } });
        }
      }
    } catch (e) {
      this.logger.error('Error handling webhook', e as any);
    }
  }
}
