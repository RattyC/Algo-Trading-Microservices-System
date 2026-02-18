// apps/market-data/src/market-data.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose'; 
import { MarketDataService } from './market-data.service';
import { MarketDataController } from './market-data.controller';
import { MarketGateway } from './market.gateway';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/algo-trading';
import { User, UserSchema } from '../../auth/src/schemas/user.schema';
import { Trade, TradeSchema } from './schemas/trade.schema';
import { MarketConfig, MarketConfigSchema } from './schemas/market-config.schema';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      
      envFilePath: require('path').join(process.cwd(), 'apps/market-data/.env'),
    }),
    
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: require('path').join(process.cwd(), 'apps/market-data/.env'),
    }),
    
  
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        console.log(`🔌 [Mongoose] Attempting connection to: ${uri}`);
        return {
          uri: uri || 'mongodb://localhost:27017/algo-trading',
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Trade.name, schema: TradeSchema },
      { name: MarketConfig.name, schema: MarketConfigSchema },
      { name: User.name, schema: UserSchema }
    ]),
    ScheduleModule.forRoot()
  ],
  controllers: [MarketDataController],
  providers: [MarketDataService, MarketGateway], 
})
export class MarketDataModule {} 