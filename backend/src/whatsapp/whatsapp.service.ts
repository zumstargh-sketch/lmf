import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

/**
 * WhatsApp integration.
 *
 * Always available: the public contact link (wa.me) built from WHATSAPP_NUMBER.
 * Activates when Meta Cloud API credentials are configured
 * (WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID): sending messages and the
 * webhook that auto-replies using the AI assistant.
 */
@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  /** The foundation's WhatsApp number, digits only (e.g. 233201234567). */
  displayNumber(): string | null {
    const digits = (process.env.WHATSAPP_NUMBER || '').replace(/[^0-9]/g, '');
    return digits.length > 0 ? digits : null;
  }

  /** Public config consumed by the apps. */
  config() {
    const number = this.displayNumber();
    return { enabled: number !== null, number };
  }

  /** Tap-to-chat deep link, optionally prefilled with a message. */
  chatLink(message?: string): string | null {
    const number = this.displayNumber();
    if (!number) return null;
    const text = message ? `?text=${encodeURIComponent(message)}` : '';
    return `https://wa.me/${number}${text}`;
  }

  private cloudApiConfigured(): boolean {
    return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
  }

  /** Sends a WhatsApp text via the Meta Cloud API. Returns true on success. */
  async sendMessage(to: string, text: string): Promise<boolean> {
    if (!this.cloudApiConfigured()) {
      this.logger.warn('WhatsApp Cloud API is not configured; message not sent.');
      return false;
    }
    try {
      await axios.post(
        `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: text }
        },
        {
          headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
          timeout: 20000
        }
      );
      return true;
    } catch (error) {
      this.logger.warn('WhatsApp Cloud API send failed.');
      return false;
    }
  }
}