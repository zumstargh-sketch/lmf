import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class NotificationsService {
  private logger = new Logger(NotificationsService.name);
  private firebaseKey = process.env.FIREBASE_SERVER_KEY || '';

  async sendToTopic(topic: string, title: string, body: string, data?: any) {
    const url = 'https://fcm.googleapis.com/fcm/send';
    const payload = {
      to: `/topics/${topic}`,
      notification: { title, body },
      data: data || {}
    };
    try {
      const resp = await axios.post(url, payload, { headers: { Authorization: `key=${this.firebaseKey}`, 'Content-Type': 'application/json' } });
      return resp.data;
    } catch (e) {
      this.logger.error('FCM send error', e as any);
      throw e;
    }
  }
}
