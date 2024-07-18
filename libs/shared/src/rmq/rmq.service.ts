import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqOptions, Transport } from '@nestjs/microservices';

@Injectable()
export class RmqService {
  public constructor(private readonly configService: ConfigService) { }

  public getOptions(queueName: string, noAck: boolean = false): RmqOptions {
    return {
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get<string>('RABBIT_MQ_URI')],
        queue: this.configService.get<string>(`RABBIT_MQ_${queueName}_QUEUE`),
        noAck,
        persistent: true,
      },
    };
  }
}
