import * as mongoose from 'mongoose';

export const EthBalanceSchema = new mongoose.Schema({
  address: String,
  balance: String,
  lastUpdated: String,
});
