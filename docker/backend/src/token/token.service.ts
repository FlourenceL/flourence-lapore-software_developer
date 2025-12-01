import { Injectable } from '@nestjs/common';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { TokenResponseDto } from './entities/token.entity';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class TokenService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;

  private readonly CONTRACT_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function totalSupply() view returns (uint256)',
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function mint(address to, uint256 amount)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function burn(uint256 amount)',
  ];

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('SEPOLIA_RPC_URL');
    const contractAddress = this.configService.get<string>(`CONTRACT_ADDRESS`);
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contract = new ethers.Contract(
      contractAddress!,
      this.CONTRACT_ABI,
      this.provider,
    );
  }

    async getTokensByAddress(address: string): Promise<TokenResponseDto> {
    try {
      // Validate address
      if (!ethers.isAddress(address)) {
        throw new BadRequestException('Invalid Ethereum address');
      }

      // Fetch all token data in parallel
      const [balance, totalSupply, tokenName, symbol, decimals] = await Promise.all([
        this.contract.balanceOf(address),
        this.contract.totalSupply(),
        this.contract.name(),
        this.contract.symbol(),
        this.contract.decimals(),
      ]);

      return {
        address,
        balance: ethers.formatUnits(balance, decimals),
        totalSupply: ethers.formatUnits(totalSupply, decimals),
        tokenName,
        symbol,
        decimals: Number(decimals),
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch tokens: ${error.message}`);
    }
  }
}

