import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EthService } from './eth.service';
import { CreateEthDto } from './dto/create-eth.dto';
import { UpdateEthDto } from './dto/update-eth.dto';

@Controller('eth')
export class EthController {
  constructor(private readonly ethService: EthService) {}

  @Get(':address')
  async findOne(@Param('address') address: string) {
    return await this.ethService.getAddressInfo(address);
  }
}
