
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({cors: {
    origin: '*', 
    methods: ['GET', 'POST'],
    credentials: true,}})
export class MarketGateway {
    @WebSocketServer()
    server: Server;

    broadcastPrice(price: number) {
        this.server.emit('price_update', {
            symbol: 'BTCUSDT',
            price,
            time: Date.now(),
        });
    }
}