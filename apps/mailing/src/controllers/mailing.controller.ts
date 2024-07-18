import { Controller, Get } from '@nestjs/common';
import { MailingService } from '../services/mailing.service';

@Controller()
export class MailingController {
  constructor(private readonly mailingService: MailingService) {}

  @Get()
  getHello(): string {
    return this.mailingService.getHello();
  }
}
