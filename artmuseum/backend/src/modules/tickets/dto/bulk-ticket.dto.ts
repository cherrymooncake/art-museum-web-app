// src/tickets/dto/bulk-ticket.dto.ts
import { Type } from 'class-transformer';
import { ValidateNested, IsInt, IsPositive } from 'class-validator';
import { TicketDto } from './ticket.dto';

export class BulkTicketDto {
  @ValidateNested()
  @Type(() => TicketDto)
  ticket: TicketDto;

  @IsInt()
  @IsPositive()
  count: number;
}
