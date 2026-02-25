// frontend-admin/app/hooks/usePortfolio.ts
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = 'http://localhost:3000'; // ยิงผ่าน API Gateway

export const usePortfolio = (currentPrice: number) => {

    const [portfolio, setPortfolio] = useState({
        balance: 0,
        holdings: [] as any[],
    });
    const [trades, setTrades] = useState<any[]>([]);

    // . ฟังก์ชันดึงข้อมูลจาก Backend (ดึงทีเดียว 3 เส้นพร้อมกันเพื่อความเร็ว)
    const fetchData = useCallback(async () => {
        const userId = Cookies.get('user_id');
        const token = Cookies.get('access_token');

        // ป้องกันการยิง API ถ้าระบบหา ID หรือ Token ไม่เจอ
        if (!userId || userId === 'undefined' || !token) {
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


            if (portRes?.status === 404) console.warn(` Portfolio Not Found for user: ${userId}`);
            if (profileRes?.status === 401) console.error('Unauthorized: Token อาจจะหมดอายุ');

            // ระบบ Fallback: พยายามหาตัวเลขเงินจาก Profile ก่อน ถ้าไม่มีค่อยไปหาใน Portfolio
            const rawBalance = profileRes?.data?.balance ?? portRes?.data?.balance ?? 0;
            const realBalance = isNaN(Number(rawBalance)) ? 0 : Number(rawBalance);
            const holdingsData = portRes?.data?.holdings || [];

            // อัปเดต State ยอดเงินและสินทรัพย์
            setPortfolio({
                ...((portRes?.data) || {}),
                balance: realBalance,
                holdings: holdingsData,
            });

            // อัปเดต State ประวัติการเทรด
            if (tradeRes?.data && Array.isArray(tradeRes.data)) {
                setTrades(
                    tradeRes.data.map((t: any) => ({
                        id: t._id,
                        type: t.type,
                        qty: Number(t.amount) || 0,
                        price: Number(t.price) || 0,
                        time: t.createdAt ? new Date(t.createdAt).toLocaleTimeString('th-TH') : 'N/A',
                    }))
                );
            } else {
                setTrades([]);
            }
        } catch (err: any) {
            console.error('❌ Fetch Data Failed:', err.message);
        }
    }, []);

    // ดึงข้อมูลอัตโนมัติเมื่อโหลด Hook นี้ครั้งแรก
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    //. ฟังก์ชันจัดการการกดปุ่มซื้อ/ขาย (Trade Execution)
    const handleTrade = async (type: 'BUY' | 'SELL', qty: number, tradePrice: number) => {
        const userId = Cookies.get('user_id');
        const token = Cookies.get('access_token');

        // ตรวจสอบความถูกต้องของข้อมูลก่อนส่งไป Backend
        if (!tradePrice || tradePrice <= 0) {
            return { success: false, msg: '⏳ กำลังรอราคาล่าสุดจากตลาด กรุณารอสักครู่...' };
        }
        if (!qty || qty <= 0) {
            return { success: false, msg: '⚠️ กรุณาระบุจำนวน BTC ที่ต้องการเทรด' };
        }

        try {
            await axios.post(
                `${BASE_URL}/market/trade`,
                {
                    userId,
                    type,
                    symbol: 'BTC/USDT',
                    amount: Number(qty),
                    price: Number(tradePrice),
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // เมื่อซื้อ/ขายสำเร็จ ให้ดึงข้อมูลกระเป๋าเงินมาอัปเดตใหม่ทันที
            await fetchData(); 
            return { success: true, msg: `ทำรายการ ${type} สำเร็จ!` };

        } catch (err: any) {

            const errorData = err.response?.data?.message;
            let finalMessage = 'เกิดข้อผิดพลาดในการทำรายการ';

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

    // คำนวณมูลค่าพอร์ตปัจจุบัน (Total Equity)
    const btcHolding = portfolio.holdings?.find((h) => h.symbol === 'BTC/USDT') || { amount: 0 };
    
    // Total Equity = เงินสดที่มี + (จำนวนเหรียญ BTC * ราคาปัจจุบัน)
    const safeCurrentPrice = isNaN(Number(currentPrice)) ? 0 : Number(currentPrice);
    const totalEquity = (Number(portfolio.balance) || 0) + (Number(btcHolding.amount || 0) * safeCurrentPrice);

    return { 
        portfolio, 
        trades, 
        handleTrade, 
        totalEquity, 
        btcHolding,
        refreshPortfolio: fetchData
    };
};