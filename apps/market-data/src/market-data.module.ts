// apps/market-data/src/market-data.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { RmqModule } from '@app/common'; 
import { MarketDataService } from './market-data.service';
import { MarketDataController } from './market-data.controller';
import { MarketGateway } from './market.gateway'; 

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/market-data/.env',
    }),
    ScheduleModule.forRoot(),
    RmqModule.register({ name: 'STRATEGY' }),
  ],
  controllers: [MarketDataController],
  providers: [
    MarketDataService, 
    MarketGateway 
  ], 
})
export class MarketDataModule {}