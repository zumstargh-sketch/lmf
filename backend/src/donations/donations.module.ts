import { Module } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { DonationsController } from './donations.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
  imports: [AuthModule],
  providers: [DonationsService, PrismaService, JwtAuthGuard],
  controllers: [DonationsController],
  exports: [DonationsService]
})
export class DonationsModule {}