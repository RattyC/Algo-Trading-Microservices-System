// frontend-admin/app/components/MarketChart.tsx
import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, AreaSeries, Time } from 'lightweight-charts';
import { io } from 'socket.io-client';

export default function MarketChart({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const lastTimeRef = useRef<number>(0);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        console.log("📊 Chart: Initializing...");
        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 400,
            layout: {
                background: { type: ColorType.Solid, color: '#0b0e11' }, // พื้นหลังมืดแบบในรูปน้อง
                textColor: '#d1d4dc',
            },
            grid: {
                vertLines: { color: 'rgba(42, 46, 57, 0.2)' },
                horzLines: { color: 'rgba(42, 46, 57, 0.2)' },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: true,
            },
        });

        const series = chart.addSeries(AreaSeries, {
            lineColor: '#2962FF',
            topColor: 'rgba(41, 98, 255, 0.3)',
            bottomColor: 'rgba(41, 98, 255, 0.05)',
            lineWidth: 2,
        });
        const socket = io('http://localhost:3003', {
            transports: ['websocket'], // บังคับใช้ websocket เพื่อเลี่ยงปัญหา CORS
        });

        socket.on('connect', () => {
            console.log("✅ Socket: Connected to Backend (3003)");
        });

        socket.on('connect_error', (err) => {
            console.error("❌ Socket Connection Error:", err.message);
        });

        const handleData = (data: any) => {
            console.log("📈 Socket: Received Data ->", data);
            
            const price = Number(typeof data === 'object' ? data.price : data);
            if (!price || isNaN(price)) return;

            let currentTime = Math.floor(Date.now() / 1000);
            if (currentTime <= lastTimeRef.current) {
                currentTime = lastTimeRef.current + 1;
            }
            lastTimeRef.current = currentTime;
            if (currentTime <= lastTimeRef.current) currentTime = lastTimeRef.current + 1;
                lastTimeRef.current = currentTime;            
            series.update({
                time: currentTime as Time,
                value: price,
            });
        };

        socket.on('priceUpdate', handleData);
        socket.on('price_update', handleData); // ดักไว้เผื่อ Backend ใช้ชื่อเดิม

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            socket.disconnect();
            chart.remove();
        };
    }, []);

    return (
        <div className="relative w-full bg-[#0b0e11] p-2 rounded-lg border border-gray-800">
            <div ref={chartContainerRef} className="w-full" />
            <div className="absolute top-4 left-6 text-xs text-blue-400 font-mono">
                System Status: Monitoring...
            </div>
        </div>
    );
}