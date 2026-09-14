import { Module } from '@nestjs/common';
import { ScholarshipsService } from './scholarships.service';
import { ScholarshipsController } from './scholarships.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [ScholarshipsService, PrismaService],
  controllers: [ScholarshipsController],
  exports: [ScholarshipsService]
})
export class ScholarshipsModule {}
