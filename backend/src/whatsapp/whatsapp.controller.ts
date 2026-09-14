import { Body, Controller, ForbiddenException, Get, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { WhatsappService } from './whatsapp.service';
import { AIService } from '../ai/ai.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private whatsapp: WhatsappService,
    private ai: AIService
  ) {}

  /** Public: lets the apps show/hide the WhatsApp chat button. */
  @Get('config')
  config() {
    return {
      ...this.whatsapp.config(),
      chatLink: this.whatsapp.chatLink('Hello Lordina Foundation! 👋')
    };
  }

  /** Meta Cloud API webhook verification handshake. */
  @Get('webhook')
  verify(@Query() query: Record<string, string>, @Res() res: Response) {
    const expected = process.env.WHATSAPP_VERIFY_TOKEN;
    if (
      query['hub.mode'] === 'subscribe' &&
      expected &&
      query['hub.verify_token'] === expected &&
      query['hub.challenge']
    ) {
      return res.status(200).send(query['hub.challenge']);
    }
    throw new ForbiddenException('Verification failed.');
  }

  /**
   * Inbound WhatsApp messages. When the Cloud API is configured, every text
   * message is answered automatically by the AI assistant.
   */
  @Post('webhook')
  async webhook(@Body() body: any) {
    try {
      const entries = body?.entry || [];
      for (const entry of entries) {
        for (const change of entry.changes || []) {
          const messages = change.value?.messages || [];
          for (const message of messages) {
            const from: string | undefined = message.from;
            const text: string = message?.text?.body || '';
            if (from && text) {
              const reply = await this.ai.ask(text);
              await this.whatsapp.sendMessage(from, reply.answer);
            }
          }
        }
      }
    } catch (error) {
      // Always acknowledge to Meta, even on internal errors.
    }
    return { received: true };
  }
}