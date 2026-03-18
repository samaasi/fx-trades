import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FxService } from './fx.service';
import { FX_PROVIDER } from '../../common/constants/tokens';
import { RedisService } from '../../infrastructure/cache/redis.service';
import { IFxProvider } from './providers/fx.provider.interface';

describe('FxService', () => {
  let service: FxService;
  let fxProvider: jest.Mocked<IFxProvider>;
  let redisService: jest.Mocked<RedisService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const fxProviderMock = {
      getLatestRates: jest.fn(),
      getConversionRate: jest.fn(),
    };

    const redisServiceMock = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const configServiceMock = {
      get: jest.fn((key: string) => {
        if (key === 'fx.exchangeRate.cacheTtl') return 3600;
        if (key === 'fx.exchangeRate.staleTtl') return 86400;
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FxService,
        { provide: FX_PROVIDER, useValue: fxProviderMock },
        { provide: RedisService, useValue: redisServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get<FxService>(FxService);
    fxProvider = module.get(FX_PROVIDER);
    redisService = module.get(RedisService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLatestRates', () => {
    const baseCurrency = 'NGN';
    const mockRates = { USD: 0.00065, EUR: 0.0006 };

    it('should return fresh data from cache if available', async () => {
      redisService.get.mockImplementation(async (key) => {
        if (key.endsWith('_fresh')) return 'true';
        if (key.startsWith('fx_rates_')) return JSON.stringify(mockRates);
        return null;
      });

      const result = await service.getLatestRates(baseCurrency);

      expect(result).toEqual(mockRates);
      expect(fxProvider.getLatestRates).not.toHaveBeenCalled();
    });

    it('should return stale data and refresh in background if fresh key is missing', async () => {
      redisService.get.mockImplementation(async (key) => {
        if (key.endsWith('_fresh')) return null;
        if (key.startsWith('fx_rates_')) return JSON.stringify(mockRates);
        return null;
      });
      fxProvider.getLatestRates.mockResolvedValue(mockRates);

      const result = await service.getLatestRates(baseCurrency);

      expect(result).toEqual(mockRates);
      // Wait a bit for background refresh
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(fxProvider.getLatestRates).toHaveBeenCalledWith(baseCurrency);
    });

    it('should fetch from provider on cold miss', async () => {
      redisService.get.mockResolvedValue(null);
      fxProvider.getLatestRates.mockResolvedValue(mockRates);

      const result = await service.getLatestRates(baseCurrency);

      expect(result).toEqual(mockRates);
      expect(fxProvider.getLatestRates).toHaveBeenCalledWith(baseCurrency);
      expect(redisService.set).toHaveBeenCalled();
    });
  });
});
