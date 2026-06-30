import { Injectable, Inject } from '@nestjs/common';

import { Ticket } from './ticket.entity';
import { TicketDto } from './dto/ticket.dto';
import { Exhibition } from '../exhibitions/exhibition.entity';
import { TICKET_REPOSITORY } from '../../core/constants';
import { BulkTicketDto } from './dto/bulk-ticket.dto';
import { Op, where, fn, col } from 'sequelize';

@Injectable()
export class TicketsService {
    constructor(@Inject(TICKET_REPOSITORY) private readonly ticketRepository: typeof Ticket) { }

    async create(ticket: TicketDto): Promise<Ticket> {
        return await this.ticketRepository.create<Ticket>({ ...ticket, exhibitionId: ticket.exhibitionId });
    }

    async findAll(): Promise<Ticket[]> {
        return await this.ticketRepository.findAll<Ticket>({
            include: [Exhibition],
        });
    }

    async findOne(id): Promise<Ticket> {
        return await this.ticketRepository.findOne({
            where: { id },
            include: [Exhibition],
        });
    }

    async delete(id) {
        return await this.ticketRepository.destroy({ where: { id } });
    }

    async update(id, data) {
        const [numberOfAffectedRows, [updatedTicket]] =
          await this.ticketRepository.update(
            { ...data, exhibitionId: data.exhibitionId},
            { where: { id }, returning: true });
        return { numberOfAffectedRows, updatedTicket };
    }

    async createMany(dto: BulkTicketDto): Promise<Ticket[]> {
        const { ticket, count } = dto;
        const rows = Array.from({ length: count }, () => ({ ...ticket }));
        return this.ticketRepository.bulkCreate(rows, { returning: true });
    }

    async deleteByExhibitionAndDate(
      exhibitionId: number,
      date: string,
    ) {
        return this.ticketRepository.destroy({
            where: {
                exhibitionId,
                [Op.and]: where(fn('DATE', col('date')), date),
                status: { [Op.ne]: 'Booked' },
            },
        });
    }

    async deleteAllUnavailable() {
        return this.ticketRepository.destroy({
            where: { status: 'Unavailable' },
        });
    }

    async markExpiredTicketsUnavailable(): Promise<number> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [updatedCount] = await this.ticketRepository.update(
          { status: 'Unavailable' },
          {
              where: {
                  date: { [Op.lt]: today },
                  status: 'Available',
              },
          },
        );
        return updatedCount;
    }

}
