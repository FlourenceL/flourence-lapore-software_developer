import { Module } from '@nestjs/common';
import { EthService } from './eth.service';
import { EthController } from './eth.controller';
import { DatabaseModule } from 'src/database/database.module';
import { ethProviders } from './eth.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [EthController],
  providers: [EthService, ...ethProviders],
})
export class EthModule {}
