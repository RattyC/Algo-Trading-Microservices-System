// frontend-admin/app/hooks/useMarket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useMarket = () => {
    const [price, setPrice] = useState<number>(0);
    const [socketConnected, setSocketConnected] = useState(false);

    useEffect(() => {
        const socket: Socket = io('http://localhost:3003', {
            transports: ['websocket'],
            withCredentials: true,
        });

        socket.on('connect', () => setSocketConnected(true));
        socket.on('disconnect', () => setSocketConnected(false));
        socket.on('price_update', (data) => setPrice(data.price));

        return () => {
            socket.disconnect();
        };
    }, []);

    return { price, socketConnected };
};
