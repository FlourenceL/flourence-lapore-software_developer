import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EthModule } from './app/eth/eth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), EthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
