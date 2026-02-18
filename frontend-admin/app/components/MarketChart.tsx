// frontend-admin/app/components/MarketChart.tsx
import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import { io } from 'socket.io-client';

export default function MarketChart({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
    const chartContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 400,
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#94a3b8',
            },
            grid: {
                vertLines: { color: '#f1f5f9' },
                horzLines: { color: '#f1f5f9' },
            },
            timeScale: { borderColor: '#f1f5f9' },
        });

        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#10b981',
            downColor: '#f43f5e',
            borderVisible: false,
            wickUpColor: '#10b981',
            wickDownColor: '#f43f5e',
        });

        const socket = io('http://localhost:3003');
        socket.on('price_update', (data) => {
            candleSeries.update({
                time: Math.floor(data.time / 1000) as any,
                open: data.price, high: data.price, low: data.price, close: data.price
            });
        });

        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            socket.disconnect();
            chart.remove();
        };
    }, []);

    return <div ref={chartContainerRef} className="w-full" />;
}