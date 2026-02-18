// apps/market-data/src/market-data.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose'; 
import { RmqModule } from '@app/common'; 
import { MarketDataService } from './market-data.service';
import { MarketDataController } from './market-data.controller';
import { MarketGateway } from './market.gateway';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/market-data';

// --- นำเข้า Schema ที่เรากำลังจะสร้าง ---
import { Trade, TradeSchema } from './schemas/trade.schema';
import { MarketConfig, MarketConfigSchema } from './schemas/market-config.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/market-data/.env',
    }),
    
    MongooseModule.forRoot(MONGODB_URI),
    MongooseModule.forFeature([
      { name: Trade.name, schema: TradeSchema },
      { name: MarketConfig.name, schema: MarketConfigSchema }
    ]),
    
    ScheduleModule.forRoot(),
    RmqModule.register({ name: 'STRATEGY' }),
  ],
  controllers: [MarketDataController],
  providers: [MarketDataService, MarketGateway], 
})
export class MarketDataModule {}