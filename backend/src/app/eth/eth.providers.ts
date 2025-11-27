import { Connection } from 'mongoose';
import { EthBalanceSchema } from 'src/database/schemas/eth-balance.schema';
import {
  DATABASE_CONNECTION,
  ETH_BALANCE_MODEL,
} from 'src/database/constants/constants';

export const ethProviders = [
  {
    provide: `${ETH_BALANCE_MODEL}`,
    useFactory: (connection: Connection) =>
      connection.model('accountbalances', EthBalanceSchema),
    inject: [`${DATABASE_CONNECTION}`],
  },
];
