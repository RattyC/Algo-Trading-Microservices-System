import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RmqService } from './rmq.service';

interface RmqModuleOptions {
    name: string;
}

@Module({
    providers: [RmqService],
    exports: [RmqService],
})
export class RmqModule {
    // ฟังก์ชันสำหรับ Service ที่จะ "ส่ง" ข้อความ (Producer)
    static register({ name }: RmqModuleOptions): DynamicModule {
        return {
            module: RmqModule,
            imports: [
                ClientsModule.registerAsync([
                    {
                        name,
                        useFactory: (configService: ConfigService) => {
                            const rabbitmqUri = configService.get<string>('RABBIT_MQ_URI') || 'amqp://localhost';
                            const queue = configService.get<string>(`RABBIT_MQ_${name}_QUEUE`) || name;
                            return {
                                transport: Transport.RMQ,
                                options: {
                                    urls: [rabbitmqUri],
                                    queue,
                                },
                            };
                        },
                        inject: [ConfigService],
                    },
                ]),
            ],
            exports: [ClientsModule],
        };
    }
}