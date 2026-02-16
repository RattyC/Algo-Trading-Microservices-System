import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } }) // ยอมให้ Frontend ทุกที่เชื่อมต่อ
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