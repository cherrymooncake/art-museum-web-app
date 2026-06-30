import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ReservationsService } from './reservations.service';
import { ReservationDto } from './dto/reservation.dto';
import { Reservation as ReservationEntity } from '../reservations/reservation.entity';
import { Ticket } from '../tickets/ticket.entity';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/guards/roles.decorator';

@Controller('reservations')
export class ReservationsController {
    constructor(private readonly reservationsService: ReservationsService) { }

    @Get()
    async findAll() {
        return await this.reservationsService.findAll();
    }
    @Get('/active-count-by-user')
    async getActiveReservationsCountByUser() {
        return this.reservationsService.getActiveReservationsCountByUser();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('my')
    async getMyReservations(@Request() req) {
        return this.reservationsService.findByUserId(req.user.id);
    }

    @Get(':id')
    async findOne(@Param('id') id: number): Promise<ReservationEntity> {
        const reservation = await this.reservationsService.findOne(id);
        if (!reservation) {
            throw new NotFoundException('This Reservation doesn\'t exist');
        }
        return reservation;
    }

    @Get(':id')
    async search(@Param('id') id: number): Promise<ReservationEntity> {
        const reservation = await this.reservationsService.findOne(id);
        if (!reservation) {
            throw new NotFoundException('This Reservation doesn\'t exist');
        }
        return reservation;
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('user/:userId')
    async findByUserId(@Param('userId') userId: number, @Request() req): Promise<ReservationEntity[]> {
        return await this.reservationsService.findByUserId(userId);
    }

    @Get('ticket/:ticketId')
    async findByTicketId(@Param('ticketId') ticketId: number): Promise<ReservationEntity> {
        return await this.reservationsService.findByTicketId(ticketId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    async create(@Body() reservation: ReservationDto, @Request() req): Promise<ReservationEntity> {
        const ticket = await Ticket.findByPk(reservation.ticketId);
        if (!ticket) {
            throw new NotFoundException(`Ticket with ID ${reservation.ticketId} not found`);
        }
        return await this.reservationsService.create(reservation, req.user.id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
    async update(@Param('id') id: number, @Body() reservation: ReservationDto, @Request() req): Promise<ReservationEntity> {
        const ticket = await Ticket.findByPk(reservation.ticketId);
        if (!ticket) {
            throw new NotFoundException(`Ticket with ID ${reservation.ticketId} not found`);
        }
        const { numberOfAffectedRows, updatedReservation: updatedReservation } = await this.reservationsService.update(id, reservation, req.user.id);
        if (numberOfAffectedRows === 0) {
            throw new NotFoundException('This Reservation doesn\'t exist');
        }
        return updatedReservation;
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @Delete(':id')
    async remove(@Param('id') id: number, @Request() req) {
        const deleted = await this.reservationsService.delete(id, req.user.id);
        if (deleted === 0) {
            throw new NotFoundException('This Reservation doesn\'t exist');
        }
        return 'Successfully deleted';
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('cancel/:id')
    async cancelReservation(@Param('id') id: number, @Request() req) {
        return await this.reservationsService.cancelReservation(id, req.user.id);
    }

}
