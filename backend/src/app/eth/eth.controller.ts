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

  @Post()
  create(@Body() createEthDto: CreateEthDto) {
    return this.ethService.create(createEthDto);
  }

  @Get(':address')
  async findOne(@Param('address') address: string) {
    return await this.ethService.findOne(address);
  }

  @Get()
  findAll() {
    return this.ethService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEthDto: UpdateEthDto) {
    return this.ethService.update(+id, updateEthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ethService.remove(+id);
  }
}
