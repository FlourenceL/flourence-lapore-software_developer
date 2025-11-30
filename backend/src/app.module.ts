import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EthModule } from './app/eth/eth.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './app/redis/redis.module';

@Module({
  imports: [ConfigModule.forRoot(), EthModule, RedisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
