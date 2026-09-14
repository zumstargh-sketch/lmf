import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { HealthController } from './health.controller';
import { ProjectsModule } from './projects/projects.module';
import { NewsModule } from './news/news.module';
import { AssistanceModule } from './assistance/assistance.module';
import { ScholarshipsModule } from './scholarships/scholarships.module';
import { DonationsModule } from './donations/donations.module';
import { VolunteersModule } from './volunteers/volunteers.module';
import { AIModule } from './ai/ai.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadsModule } from './uploads/uploads.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ProjectsModule,
    NewsModule,
    AssistanceModule,
    ScholarshipsModule,
    DonationsModule,
    VolunteersModule,
    AIModule,
    PaymentsModule,
    NotificationsModule,
    UploadsModule,
    DashboardModule,
    WhatsappModule
  ],
  providers: [PrismaService],
  controllers: [HealthController]
})
export class AppModule {}
