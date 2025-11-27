import { Model } from 'mongoose';
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CreateEthDto } from './dto/create-eth.dto';
import { UpdateEthDto } from './dto/update-eth.dto';
import { ETH_BALANCE_MODEL } from 'src/database/constants/constants';
import { Eth } from './entities/eth.entity';
import { ethers } from 'ethers';

@Injectable()
export class EthService {
  private provider: ethers.JsonRpcProvider;
  constructor(
    @Inject(`${ETH_BALANCE_MODEL}`)
    private ethBalanceModel: Model<Eth>,
  ) {
    const rpcUrl = process.env.ETHEREUM_RPC_URL;
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  create(createEthDto: CreateEthDto): Promise<Eth> {
    const createdEth = new this.ethBalanceModel(createEthDto);
    return createdEth.save();
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

  findAll() {
    return `This action returns all eth`;
  }

  update(id: number, updateEthDto: UpdateEthDto) {
    return `This action updates a #${id} eth`;
  }

  remove(id: number) {
    return `This action removes a #${id} eth`;
  }
}
