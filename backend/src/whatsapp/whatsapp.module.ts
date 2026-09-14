import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [AIModule],
  providers: [WhatsappService, PrismaService],
  controllers: [WhatsappController],
  exports: [WhatsappService]
})
export class WhatsappModule {}