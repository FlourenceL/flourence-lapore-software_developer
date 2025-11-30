import { Model } from 'mongoose';
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CreateEthDto } from './dto/create-eth.dto';
import { UpdateEthDto } from './dto/update-eth.dto';
import { ETH_BALANCE_MODEL } from 'src/database/constants/constants';
import { Eth } from './entities/eth.entity';
import { ethers } from 'ethers';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class EthService {
  private provider: ethers.JsonRpcProvider;
  private readonly GAS_PRICE_CACHE_KEY = 'ethereum:gasPrice';
  private readonly BLOCK_NUMBER_CACHE_KEY = 'ethereum:blockNumber';
  private readonly CACHE_TTL = 30; // 30 seconds

  constructor(
    @Inject(`${ETH_BALANCE_MODEL}`)
    private ethBalanceModel: Model<Eth>,
    private redisService: RedisService,
  ) {
    const rpcUrl = process.env.ETHEREUM_RPC_URL;
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  async findOne(address: string) {
    if (!ethers.isAddress(address)) {
      throw new BadRequestException('Invalid Ethereum address');
    }
    try {
      const [gasPrice, blockNumber, balance] = await Promise.all([
        this.provider.getFeeData(),
        this.provider.getBlockNumber(),
        this.provider.getBalance(address),
      ]);

      return {
        address,
        gasPrice: {
          wei: gasPrice.gasPrice?.toString(),
          gwei: ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei'),
        },
        blockNumber,
        balance: {
          wei: balance.toString(),
          ether: ethers.formatEther(balance),
        },
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch Ethereum data: ${error.message}`,
      );
    }
  }

  async getAddressInfo(address: string) {
    if (!ethers.isAddress(address)) {
      throw new BadRequestException('Invalid Ethereum address');
    }

    try {
      // Get gas price and block number from cache or API
      const [gasPrice, blockNumber, balance] = await Promise.all([
        this.getGasPrice(),
        this.getBlockNumber(),
        this.getBalance(address),
      ]);

      // Store balance in database
      await this.saveAccountBalance(address, balance.toString());

      return {
        address,
        gasPrice: {
          wei: gasPrice.toString(),
          gwei: ethers.formatUnits(gasPrice, 'gwei'),
        },
        blockNumber,
        balance: {
          wei: balance.toString(),
          ether: ethers.formatEther(balance),
        },
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch Ethereum data: ${error.message}`,
      );
    }
  }

  private async getGasPrice(): Promise<bigint> {
    // Try to get from cache first
    const cached = await this.redisService.get(this.GAS_PRICE_CACHE_KEY);
    if (cached) {
      console.log('used cached: getGasPrice')
      return BigInt(cached);
    }

    // If not in cache, fetch from blockchain
    const feeData = await this.provider.getFeeData();
    const gasPrice = feeData.gasPrice || BigInt(0);

    // Store in cache
    await this.redisService.set(
      this.GAS_PRICE_CACHE_KEY,
      gasPrice.toString(),
      this.CACHE_TTL,
    );
    console.log('stored in cache')
    return gasPrice;
  }

  private async getBlockNumber(): Promise<number> {
    // Try to get from cache first
    const cached = await this.redisService.get(this.BLOCK_NUMBER_CACHE_KEY);
    if (cached) {
      console.log('used cache: getBlockNumber')
      return parseInt(cached);
    }

    // If not in cache, fetch from blockchain
    const blockNumber = await this.provider.getBlockNumber();

    // Store in cache
    await this.redisService.set(
      this.BLOCK_NUMBER_CACHE_KEY,
      blockNumber.toString(),
      this.CACHE_TTL,
    );
    console.log('stored in cache: getBlockNumber')

    return blockNumber;
  }

  private async getBalance(address: string): Promise<bigint> {
    return await this.provider.getBalance(address);
  }

  private async saveAccountBalance(address: string, balance: string) {
    await this.ethBalanceModel.findOneAndUpdate(
      { address },
      {
        balance,
        lastUpdated: new Date(),
      },
      {
        upsert: true,
        new: true,
      },
    );
  }

  async getBalanceHistory(address: string) {
    if (!ethers.isAddress(address)) {
      throw new BadRequestException('Invalid Ethereum address');
    }

    return await this.ethBalanceModel
      .find({ address })
      .sort({ lastUpdated: -1 })
      .exec();
  }
}
