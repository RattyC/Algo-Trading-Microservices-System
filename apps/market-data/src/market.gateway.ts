import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*', 
        methods: ['GET', 'POST'],
        credentials: true,
    }
})
export class MarketGateway {
    @WebSocketServer()
    server: Server;

    broadcastPrice(price: number) {
        this.server.emit('priceUpdate', {
            symbol: 'BTCUSDT',
            price: price,
            time: Date.now(),
        });
    }
}