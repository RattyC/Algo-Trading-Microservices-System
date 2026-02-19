import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useMarket = () => {
    const [price, setPrice] = useState<number>(0);
    const [socketConnected, setSocketConnected] = useState(false);

    useEffect(() => {
        const socket: Socket = io('http://localhost:3003', {
            transports: ['websocket'],
            withCredentials: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            console.log("✅ Socket: Connected to Backend (3003)");
            setSocketConnected(true);
        });

        socket.on('disconnect', () => {
            setSocketConnected(false);
        });


        socket.on('priceUpdate', (arg1, arg2) => {
            // กรณีที่ 1: ส่งมาเป็นตัวเลขเพียวๆ (เช่น emit('priceUpdate', 49000))
            if (typeof arg1 === 'number') {
                setPrice(arg1);
            }
            // กรณีที่ 2: ส่งมาเป็น Object (เช่น emit('priceUpdate', { price: 49000 }))
            else if (arg1 && typeof arg1.price === 'number') {
                setPrice(arg1.price);
            }
            // กรณีที่ 3: เผื่อตัวเลขดันไปอยู่ใน argument ตัวที่ 2
            else if (typeof arg2 === 'number') {
                setPrice(arg2);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return { price, socketConnected };
};