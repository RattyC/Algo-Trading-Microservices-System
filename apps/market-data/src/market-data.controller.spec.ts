import { Test, TestingModule } from '@nestjs/testing';
import { MarketDataController } from './market-data.controller';
import { MarketDataService } from './market-data.service';

describe('MarketDataController', () => {
  let marketDataController: MarketDataController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MarketDataController],
      providers: [MarketDataService],
    }).compile();

    marketDataController = app.get<MarketDataController>(MarketDataController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(marketDataController.getHello()).toBe('Hello World!');
    });
  });
});
