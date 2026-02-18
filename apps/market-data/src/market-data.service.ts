// apps/market-data/src/market-data.service.ts

import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { MarketGateway } from './market.gateway';
import { Trade } from './schemas/trade.schema';
import { MarketConfig } from './schemas/market-config.schema';
import { CreateTradeDto } from './dto/create-trade.dto';
import { User } from '../../auth/src/schemas/user.schema';

@Injectable()
export class MarketDataService implements OnModuleInit {
  private currentPrice = 50000;
  private isManualOverride = false;
  private currentVolatility = 0.0015;

  constructor(
    private readonly gateway: MarketGateway,
    @InjectModel(Trade.name) private readonly tradeModel: Model<Trade>,
    @InjectModel(MarketConfig.name) private readonly configModel: Model<MarketConfig>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) { }

  async setVolatility(level: 'low' | 'normal' | 'high' | 'crash') {
    const levels = { low: 0.0005, normal: 0.0015, high: 0.005, crash: 0.02 };
    this.currentVolatility = levels[level];

    // บันทึกค่าลง MongoDB (Update Operation)
    await this.configModel.updateOne({}, { volatility: level });
    console.log(`⚠️ Market Volatility set to: ${level}`);
  }


  async onModuleInit() {
    const config = await this.configModel.findOne().exec();
    if (config) {
      this.currentPrice = config.lastPrice;
      console.log(`📡 Loaded Market State: $${this.currentPrice}`);
    } else {
      await this.configModel.create({ lastPrice: 50000, volatility: 'normal' });
    }
  }
  async getPortfolio(userId: string) {
    const user = await this.userModel.findById(userId).select('balance holdings').exec();
    if (!user) throw new BadRequestException('ไม่พบข้อมูลผู้ใช้');
    return user;
  }
  // แก้ไข Logic การเทรด: จัดการยอดเงินและราคาเฉลี่ย
  async executeTrade(userId: string, dto: CreateTradeDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('ไม่พบผู้ใช้ในระบบ');

    const { type, amount, price, symbol } = dto;
    const totalCost = price * amount;

    // หาเหรียญใน Holdings (ถ้าไม่มีให้สร้างใหม่)
    let holding = user.holdings.find(h => h.symbol === symbol);
    if (!holding) {
      const newHolding = { symbol, amount: 0, avgPrice: 0 };
      user.holdings.push(newHolding);
      holding = user.holdings[user.holdings.length - 1];
    }

    if (type === 'BUY') {
      if (user.balance < totalCost) throw new BadRequestException('ยอดเงินคงเหลือไม่พอสำหรับการซื้อ');

      // คำนวณต้นทุนเฉลี่ย (Weighted Average Price)
      const newAmount = holding.amount + amount;
      const newAvgPrice = ((holding.amount * holding.avgPrice) + totalCost) / newAmount;

      user.balance -= totalCost;
      holding.amount = newAmount;
      holding.avgPrice = newAvgPrice;
    } else if (type === 'SELL') {
      if (holding.amount < amount) throw new BadRequestException('จำนวนเหรียญในพอร์ตไม่พอขาย');

      user.balance += totalCost;
      holding.amount -= amount;
      // ราคาเฉลี่ยไม่เปลี่ยนตอนขาย แต่จำนวนเหรียญลดลง
    }

    // 💾 บันทึกทุกลง MongoDB พร้อมกัน (Data Integrity)
    await user.save();
    return await this.tradeModel.create({ ...dto, userId });
  }

  @Cron('*/2 * * * * *')
  async generatePrice() {
    if (!this.isManualOverride) {
      const standardChange = this.currentPrice * (0.00002 + this.currentVolatility * this.gaussianRandom());
      this.currentPrice += standardChange;
    }

    this.currentPrice = Number.parseFloat(this.currentPrice.toFixed(2));
    this.gateway.broadcastPrice(this.currentPrice);

    await this.configModel.updateOne({}, { lastPrice: this.currentPrice });
  }

  // ใช้ executeTrade แทน createTrade เพื่อให้ข้อมูลกระเป๋าเงินอัปเดตด้วย
  async createTrade(dto: CreateTradeDto) {
    return this.executeTrade(dto.userId, dto);
  }

  async getTradeHistory(userId: string) {
    return await this.tradeModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async purgeTradeHistory() {
    return await this.tradeModel.deleteMany({}).exec();
  }

  resetToAuto() {
    this.isManualOverride = false;
  }

  forcePrice(price: number) {
    this.currentPrice = price;
    this.isManualOverride = true;
    this.gateway.broadcastPrice(this.currentPrice);
  }

  private gaussianRandom() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
}