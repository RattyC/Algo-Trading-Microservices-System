import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';

@Injectable()
export class RmqService {
    constructor(private readonly configService: ConfigService) { }

    // ฟังก์ชันสำหรับ Service ที่จะ "รับ" ข้อความ (Consumer)
    getOptions(queue: string, noAck = false): RmqOptions {
        return {
            transport: Transport.RMQ,
            options: {
                urls: [this.configService.get<string>('RABBIT_MQ_URI') || 'amqp://localhost'],
                queue: this.configService.get<string>(`RABBIT_MQ_${queue}_QUEUE`) || queue,
                noAck,
                persistent: true,
            },
        };
    }

    // ฟังก์ชันยืนยันว่าทำงานเสร็จแล้ว (Ack)
    ack(context: RmqContext) {
        const channel = context.getChannelRef();
        const originalMessage = context.getMessage();
        channel.ack(originalMessage);
    }
}