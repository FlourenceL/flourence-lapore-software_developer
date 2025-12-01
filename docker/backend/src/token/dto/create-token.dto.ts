import { TokenDto } from '../entities/token.entity';

export class CreateTokenDto {
 address: string;
  balance: string;
  totalSupply: string;
  tokenName: string;
  symbol: string;
  decimals: number;
}
