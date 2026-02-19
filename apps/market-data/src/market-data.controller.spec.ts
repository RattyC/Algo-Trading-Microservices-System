// apps/market-data/src/market-data.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { MarketDataController } from './market-data.controller';
import { MarketDataService } from './market-data.service';

describe('MarketDataController', () => {
  let marketDataController: MarketDataController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MarketDataController],
      providers: [
        {
          provide: MarketDataService,
          useValue: {}, 
        }
      ],
    }).compile();

    marketDataController = app.get<MarketDataController>(MarketDataController);
  });

  it('should be defined', () => {
    expect(marketDataController).toBeDefined();
  });
});