import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = 'http://localhost:3000';

export const usePortfolio = (currentPrice: number) => {
    const [portfolio, setPortfolio] = useState({
        balance: 0,
        holdings: [] as any[],
    });
    const [trades, setTrades] = useState<any[]>([]);

    const fetchData = useCallback(async () => {
        const userId = Cookies.get('user_id');
        const token = Cookies.get('access_token');

        if (!userId || !token) {
            console.warn('⚠️ Missing UserID or Token');
            return;
        }

        const authConfig = {
            headers: { Authorization: `Bearer ${token}` },
        };

        try {
            const [portRes, tradeRes, profileRes] = await Promise.all([
                axios.get(`${BASE_URL}/market/portfolio/${userId}`, authConfig).catch(e => e.response),
                axios.get(`${BASE_URL}/market/trades/${userId}`, authConfig).catch(e => e.response),
                axios.get(`${BASE_URL}/auth/profile`, authConfig).catch(e => e.response)
            ]);

            if (portRes?.status === 404) {
                console.error(`❌ Portfolio Route Not Found: ${BASE_URL}/market/portfolio/${userId}`);
            }
            if (profileRes?.status === 401) {
                console.error('🔒 Unauthorized: Token is invalid or expired.');
            }

            const realBalance =
                (profileRes as any)?.data?.balance ??
                (portRes as any)?.data?.balance ??
                0;
            const holdingsData = (portRes as any)?.data?.holdings || [];

            setPortfolio({
                ...((portRes as any)?.data || {}),
                balance: Number(realBalance),
                holdings: holdingsData,
            });

            if ((tradeRes as any)?.data && Array.isArray((tradeRes as any).data)) {
                setTrades(
                    (tradeRes as any).data.map((t: any) => ({
                        id: t._id,
                        type: t.type,
                        qty: t.amount,
                        price: t.price,
                        time: t.createdAt
                            ? new Date(t.createdAt).toLocaleTimeString()
                            : 'N/A',
                    })),
                );
            } else {
                setTrades([]);
            }
        } catch (err: any) {
            console.error('❌ Fetch failed logic:', err.message);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleTrade = async (type: 'BUY' | 'SELL', qty: number, tradePrice: number) => {
        const userId = Cookies.get('user_id');
        const token = Cookies.get('access_token');

        if (!tradePrice || tradePrice <= 0) {
            return { success: false, msg: 'กำลังรอราคาล่าสุดจากตลาด กรุณารอสักครู่...' };
        }
        if (!qty || qty <= 0) {
            return { success: false, msg: 'กรุณาระบุจำนวน BTC ที่ต้องการเทรด' };
        }

        try {
            await axios.post(
                `${BASE_URL}/market/trade`,
                {
                    userId,
                    type,
                    symbol: 'BTC/USDT',
                    amount: Number(qty),        // แปลงเป็นตัวเลขเสมอ
                    price: Number(tradePrice),  // แปลงเป็นตัวเลขเสมอ
                },
                { headers: { Authorization: `Bearer ${token}` } },
            );

            await fetchData(); // โหลดข้อมูล Portfolio และ ประวัติเทรดใหม่
            return { success: true };
        } catch (err: any) {
            // จัดการ Error Message ที่ NestJS ส่งมา (เผื่อส่งมาเป็น Array)
            const errorData = err.response?.data?.message;
            let finalMessage = 'การเชื่อมต่อผิดพลาด';

            if (Array.isArray(errorData)) {
                finalMessage = errorData.join(', ');
            } else if (typeof errorData === 'string') {
                finalMessage = errorData;
            }

            return {
                success: false,
                msg: finalMessage,
            };
        }
    };

    const btcHolding = portfolio.holdings?.find(
        (h) => h.symbol === 'BTC/USDT',
    ) || { amount: 0 };

    const totalEquity =
        (Number(portfolio.balance) || 0) +
        Number(btcHolding.amount || 0) * currentPrice;

    return { portfolio, trades, handleTrade, totalEquity, btcHolding };
};