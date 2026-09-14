import { Module } from '@nestjs/common';
import { AssistanceService } from './assistance.service';
import { AssistanceController } from './assistance.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [AssistanceService, PrismaService],
  controllers: [AssistanceController],
  exports: [AssistanceService]
})
export class AssistanceModule {}
