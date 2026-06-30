import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { TicketsService } from './tickets.service';
import { Ticket as TicketEntity } from './ticket.entity';
import { TicketDto } from './dto/ticket.dto';
import { Exhibition } from '../exhibitions/exhibition.entity';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/guards/roles.decorator';
import { BulkTicketDto } from './dto/bulk-ticket.dto';

@Controller('tickets')
export class TicketsController {
    constructor(private readonly ticketService: TicketsService) { }

    @Get()
    async findAll() {
        return await this.ticketService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: number): Promise<TicketEntity> {
        const ticket = await this.ticketService.findOne(id);
        if (!ticket) {
            throw new NotFoundException('This Ticket doesn\'t exist');
        }
        return ticket;
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @Post()
    async create(@Body() ticket: TicketDto): Promise<TicketEntity> {
        const exhibition = await Exhibition.findByPk(ticket.exhibitionId);
        if (!exhibition) {
            throw new NotFoundException(`Exhibition with ID ${ticket.exhibitionId} not found`);
        }
        return await this.ticketService.create(ticket);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @Put(':id')
    async update(@Param('id') id: number, @Body() ticket: TicketDto): Promise<TicketEntity> {
        const exhibition = await Exhibition.findByPk(ticket.exhibitionId);
        if (!exhibition) {
            throw new NotFoundException(`Exhibition with ID ${ticket.exhibitionId} not found`);
        }
        const { numberOfAffectedRows, updatedTicket } = await this.ticketService.update(id, ticket);
        if (numberOfAffectedRows === 0) {
            throw new NotFoundException('This Ticket doesn\'t exist');
        }
        return updatedTicket;
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @Delete('by-exhibition')
    async removeByExhibition(
      @Body('exhibitionId') exhibitionId: number,
      @Body('date') date: string,
    ) {
        const deleted = await this.ticketService.deleteByExhibitionAndDate(
          exhibitionId,
          date,
        );
        return { deleted };
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @Delete('unavailable')
    async removeUnavailable() {
        const deleted = await this.ticketService.deleteAllUnavailable();
        return { deleted };
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @Delete(':id(\\d+)')
    async remove(@Param('id') id: number) {
        const deleted = await this.ticketService.delete(id);
        if (deleted === 0) {
            throw new NotFoundException('This Ticket doesn\'t exist');
        }
        return 'Successfully deleted';
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @Post('bulk')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    async bulkCreate(@Body() dto: BulkTicketDto) {
        const ex = await Exhibition.findByPk(dto.ticket.exhibitionId);
        if (!ex) { throw new NotFoundException(`Exhibition ${dto.ticket.exhibitionId} not found`); }
        return this.ticketService.createMany(dto);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @Post('mark-expired-unavailable')
    async markExpiredTicketsUnavailable() {
        const updatedCount = await this.ticketService.markExpiredTicketsUnavailable();
        return { updatedCount, message: `${updatedCount} билетов обновлено в статус 'Unavailable'` };
    }

}
