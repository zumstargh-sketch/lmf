import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { DonationsService } from '../donations/donations.service';
import { Request, Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private donations: DonationsService) {}

  @Post('paystack/init')
  async init(@Body() body: any) {
    return this.donations.createDonation(body);
  }

  @Post('paystack/webhook')
  async webhook(@Req() req: Request, @Res() res: Response) {
    // basic handler that expects Paystack to POST a JSON payload
    const payload = req.body;
    // In production verify signature using PAYSTACK_SECRET
    // Handle event and update donation status accordingly
    // For now, just acknowledge
    console.log('Paystack webhook received', payload?.event);
    res.status(200).send({ received: true });
  }
}
