import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { WalletService } from './wallet.service';
import { Wallet } from './entities/wallet.entity';
import { FxService } from '../fx/fx.service';
import { TransactionService } from '../transaction/transaction.service';
import { BadRequestException } from '@nestjs/common';

describe('WalletService', () => {
  let service: WalletService;
  let walletRepository: jest.Mocked<Repository<Wallet>>;
  let fxService: jest.Mocked<FxService>;
  let transactionService: jest.Mocked<TransactionService>;
  let dataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    const walletRepositoryMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const fxServiceMock = {
      getConversionRate: jest.fn(),
    };

    const transactionServiceMock = {
      recordTransaction: jest.fn(),
    };

    const entityManagerMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const dataSourceMock = {
      transaction: jest.fn((cb) => cb(entityManagerMock)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: getRepositoryToken(Wallet), useValue: walletRepositoryMock },
        { provide: FxService, useValue: fxServiceMock },
        { provide: TransactionService, useValue: transactionServiceMock },
        { provide: DataSource, useValue: dataSourceMock },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    walletRepository = module.get(getRepositoryToken(Wallet));
    fxService = module.get(FxService);
    transactionService = module.get(TransactionService);
    dataSource = module.get(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBalances', () => {
    it('should return wallet balances', async () => {
      const userId = 'user-1';
      const mockWallet = { userId, balances: { NGN: 100 } } as unknown as Wallet;
      walletRepository.findOne.mockResolvedValue(mockWallet);

      const result = await service.getBalances(userId);

      expect(result).toEqual({ NGN: 100 });
      expect(walletRepository.findOne).toHaveBeenCalled();
    });

    it('should create and return a new wallet if not found', async () => {
      const userId = 'user-2';
      walletRepository.findOne.mockResolvedValue(null);
      walletRepository.create.mockReturnValue({ userId, balances: {} } as Wallet);

      const result = await service.getBalances(userId);

      expect(result).toEqual({});
      expect(walletRepository.create).toHaveBeenCalled();
      expect(walletRepository.save).toHaveBeenCalled();
    });
  });

  describe('convert', () => {
    it('should throw BadRequestException if balance is insufficient', async () => {
      const userId = 'user-1';
      const convertDto = { fromCurrency: 'USD', toCurrency: 'NGN', amount: 100 };
      
      fxService.getConversionRate.mockResolvedValue(1500);
      
      // Mock the transaction manager finding a wallet with 0 balance
      const entityManagerMock = {
        findOne: jest.fn().mockResolvedValue({ userId, balances: { USD: 0 } }),
      };
      (dataSource.transaction as any).mockImplementation(async (cb: any) => cb(entityManagerMock));

      await expect(service.convert(userId, convertDto)).rejects.toThrow(BadRequestException);
    });

    it('should successfully convert and update balances', async () => {
      const userId = 'user-1';
      const convertDto = { fromCurrency: 'USD', toCurrency: 'NGN', amount: 10 };
      const rate = 1500;
      
      fxService.getConversionRate.mockResolvedValue(rate);
      
      const mockWallet = { userId, balances: { USD: 20, NGN: 0 } };
      const entityManagerMock = {
        findOne: jest.fn().mockResolvedValue(mockWallet),
        save: jest.fn().mockResolvedValue(mockWallet),
      };
      (dataSource.transaction as any).mockImplementation(async (cb: any) => cb(entityManagerMock));

      const result = await service.convert(userId, convertDto);

      expect(result.USD).toBe(10);
      expect(result.NGN).toBe(15000);
      expect(transactionService.recordTransaction).toHaveBeenCalled();
    });
  });
});
