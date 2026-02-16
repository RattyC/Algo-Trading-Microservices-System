import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthLibModule } from 'apps/auth/src'; // 
import { MarketController } from './api-gateway.controller'; 

@Module({
  imports: [

    AuthLibModule,


    ClientsModule.register([
      {
        name: 'MARKET_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5672'], 
          queue: 'market_queue', 
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [MarketController], 
  providers: [],
})
export class ApiGatewayModule {}