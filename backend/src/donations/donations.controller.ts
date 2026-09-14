import { BadRequestException, Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { DonationsService } from './donations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('donations')
export class DonationsController {
  constructor(private svc: DonationsService) {}

  /** Only signed-in donors can start a donation. */
  @Post('init')
  @UseGuards(JwtAuthGuard)
  async init(@Req() req: Request, @Body() body: any) {
    const donor = (req as Request & { user: any }).user;
    return this.svc.createDonation(body, donor);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.svc.get(id);
  }
}