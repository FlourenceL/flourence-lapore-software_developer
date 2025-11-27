import { PartialType } from '@nestjs/mapped-types';
import { CreateEthDto } from './create-eth.dto';

export class UpdateEthDto extends PartialType(CreateEthDto) {}
