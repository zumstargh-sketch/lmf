import { Controller, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private svc: NotificationsService) {}

  @Post('topic')
  async sendToTopic(@Body() body: any) {
    // body: { topic, title, message, data }
    return this.svc.sendToTopic(body.topic, body.title, body.message, body.data);
  }
}
