// apps/market-data/src/market-data.service.ts
import { Injectable, OnModuleInit, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { MarketGateway } from './market.gateway';
import { Trade, TradeDocument } from './schemas/trade.schema';
import { MarketConfig, MarketConfigDocument } from './schemas/market-config.schema';
import { CreateTradeDto } from './dto/create-trade.dto';
import { User, UserDocument, UsersService } from '@app/common'; 

@Injectable()
export class MarketDataService implements OnModuleInit {
  private currentPrice = 50000;
  private isManualOverride = false;
  private currentVolatility = 0.0015;

  constructor(
    private readonly gateway: MarketGateway,
    private readonly usersService: UsersService,
    @InjectModel(Trade.name) private readonly tradeModel: Model<TradeDocument>,
    @InjectModel(MarketConfig.name) private readonly configModel: Model<MarketConfigDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) { }

  async getPortfolio(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');
    return {
      balance: user.balance || 0,
      holdings: user.holdings || []
    };
  }

  async executeTrade(userId: string, dto: CreateTradeDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('ไม่พบผู้ใช้ในระบบ');

    const { type, amount, price, symbol } = dto;

    if (price <= 0) {
        throw new BadRequestException('ราคาของเหรียญต้องมากกว่า 0');
    }
    if (amount <= 0) {
        throw new BadRequestException('จำนวนเหรียญต้องมากกว่า 0');
    }

    const totalCost = price * amount;

    if (!user.holdings) user.holdings = [];
    let holding = user.holdings.find(h => h.symbol === symbol);

    if (!holding) {
      user.holdings.push({ symbol, amount: 0, avgPrice: 0 });
      holding = user.holdings[user.holdings.length - 1];
    }

    if (type === 'BUY') {
      if (user.balance < totalCost) throw new BadRequestException('ยอดเงินไม่พอ');
      holding.avgPrice = ((holding.amount * holding.avgPrice) + totalCost) / (holding.amount + amount);
      user.balance -= totalCost;
      holding.amount += amount;
    } else {
      if (holding.amount < amount) throw new BadRequestException('เหรียญไม่พอขาย');
      user.balance += totalCost;
      holding.amount -= amount;
    }

    await user.save();
    return await this.tradeModel.create({ ...dto, userId });
  }

  async getTradeHistory(userId: string) { 
    return await this.tradeModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async purgeTradeHistory() { 
    return await this.tradeModel.deleteMany({}).exec();
  }



  async forcePrice(price: number) { 
    this.currentPrice = price;
    this.isManualOverride = true;
    await this.configModel.updateOne({}, { lastPrice: price }, { upsert: true });
    this.gateway.broadcastPrice(this.currentPrice);
  }

  async setVolatility(level: 'low' | 'normal' | 'high' | 'crash') { 
    const levels = { low: 0.0005, normal: 0.0015, high: 0.005, crash: 0.02 };
    this.currentVolatility = levels[level];
    await this.configModel.updateOne({}, { volatility: level }, { upsert: true });
  }

  resetToAuto() { // 
    this.isManualOverride = false;
  }



  async onModuleInit() {
    try {
        const config = await this.configModel.findOne();
        if (!config || !config.lastPrice || config.lastPrice <= 0) {
            const initialPrice = 50000.00;
            await this.configModel.updateOne(
                {}, 
                { lastPrice: initialPrice, volatility: 'normal' }, 
                { upsert: true }
            );
            this.currentPrice = initialPrice;
            console.log('🚀 [Market] Initialized with default price: 50,000');
        } else {
            this.currentPrice = Number(config.lastPrice);
            console.log(`🚀 [Market] Loaded existing price: ${this.currentPrice}`);
        }
    } catch (err) {
        console.error('❌ [Market] Failed to initialize price:', err);
        this.currentPrice = 50000.00; 
    }
}

  @Cron('*/2 * * * * *')
  async generatePrice() {
    if (!this.isManualOverride) {
      const basePrice = this.currentPrice > 0 ? this.currentPrice : 50000;
      const standardChange = basePrice * (0.00002 + this.currentVolatility * this.gaussianRandom());
      this.currentPrice = Number(basePrice + standardChange);
    }
    this.currentPrice = Number(this.currentPrice.toFixed(2));
    this.gateway.broadcastPrice(this.currentPrice);
    this.gateway.broadcastPrice(this.currentPrice);
    console.log('📈 Current Price:', this.currentPrice);
    await this.configModel.updateOne({}, { lastPrice: this.currentPrice });
  }

  private gaussianRandom() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
}