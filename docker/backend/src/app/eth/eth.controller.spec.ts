import { Test, TestingModule } from '@nestjs/testing';
import { EthController } from './eth.controller';
import { EthService } from './eth.service';

describe('EthController', () => {
  let controller: EthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EthController],
      providers: [EthService],
    }).compile();

    controller = module.get<EthController>(EthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
