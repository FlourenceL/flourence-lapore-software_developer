export class TokenDto {
  tokenId: string;
  owner: string;
}

export class TokenResponseDto {
  address: string;
  balance: string;
  totalSupply: string;
  tokenName: string;
  symbol: string;
  decimals: number;
}