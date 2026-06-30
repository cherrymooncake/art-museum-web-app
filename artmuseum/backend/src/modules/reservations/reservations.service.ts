import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { Reservation } from './reservation.entity';
import { ReservationDto } from './dto/reservation.dto';
import { Ticket } from '../tickets/ticket.entity';
import { User } from '../users/user.entity';
import {
    RESERVATION_REPOSITORY,
    MAX_ACTIVE_RESERVATIONS,
    SEQUELIZE,
} from '../../core/constants';
import { Sequelize } from 'sequelize-typescript';
import { Transaction, QueryTypes } from 'sequelize';

@Injectable()
export class ReservationsService {
    constructor(
      @Inject(RESERVATION_REPOSITORY)
      private readonly reservationRepository: typeof Reservation,

      @Inject(SEQUELIZE)
      private readonly sequelize: Sequelize,
    ) {}

    async create(dto: ReservationDto, userId: number): Promise<Reservation> {
        return this.sequelize.transaction(
          { isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE },
          async (t) => {
              const activeRows = await this.sequelize.query<{ id: number }>(
                `
            SELECT id
            FROM "Reservations"
            WHERE "userId" = :userId
              AND status = 'Active'
            FOR UPDATE
            `,
                {
                    replacements: { userId },
                    transaction: t,
                    type: QueryTypes.SELECT,
                },
              );
              if (activeRows.length >= MAX_ACTIVE_RESERVATIONS) {
                  throw new BadRequestException(
                    `Лимит в ${MAX_ACTIVE_RESERVATIONS} активных броней уже исчерпан`,
                  );
              }

              const ticketRows = await this.sequelize.query<Ticket>(
                `
            SELECT *
            FROM "Tickets"
            WHERE id = :ticketId
            FOR UPDATE
            `,
                {
                    replacements: { ticketId: dto.ticketId },
                    transaction: t,
                    type: QueryTypes.SELECT,
                },
              );
              const ticket = ticketRows[0];
              if (!ticket) {
                  throw new NotFoundException(`Билет с ID ${dto.ticketId} не найден`);
              }

              if (ticket.status !== 'Available') {
                  throw new BadRequestException('Билет уже забронирован или недоступен');
              }

              const existingReservation = await this.reservationRepository.findOne({
                  where: {
                      ticketId: dto.ticketId,
                      status: 'Active',
                  },
                  transaction: t,
              });
              if (existingReservation) {
                  throw new BadRequestException('Билет уже забронирован в другой броне');
              }

              let totalPrice = Number(ticket.price);
              switch (dto.type) {
                  case 'Child':
                      totalPrice *= 0.3;
                      break;
                  case 'Student':
                  case 'Senior':
                      totalPrice *= 0.5;
                      break;
              }
              totalPrice = Number(totalPrice.toFixed(2));

              ticket.status = 'Booked';
              await this.sequelize.query(
                `UPDATE "Tickets" SET status = 'Booked' WHERE id = :ticketId`,
                {
                    replacements: { ticketId: dto.ticketId },
                    transaction: t,
                },
              );

              return this.reservationRepository.create(
                {
                    ...dto,
                    totalPrice,
                    userId,
                },
                { transaction: t },
              );
          },
        );
    }

    async findAll(): Promise<Reservation[]> {
        return await this.reservationRepository.findAll<Reservation>({
            include: [Ticket, { model: User, attributes: { exclude: ['password'] } }],
        });
    }

    async findOne(id): Promise<Reservation> {
        return await this.reservationRepository.findOne({
            where: { id },
            include: [Ticket, { model: User, attributes: { exclude: ['password'] } }],
        });
    }
    async delete(id: number, userId) {
        const reservation = await this.reservationRepository.findOne({
            where: { id, userId },
        });

        if (!reservation) {
            throw new NotFoundException('Бронь не найдена');
        }
        const ticket = await Ticket.findByPk(reservation.ticketId);
        if (!ticket) {
            throw new NotFoundException(`Ticket with ID ${reservation.ticketId} not found`);
        }
        ticket.status = 'Available';
        await ticket.save();
        return await this.reservationRepository.destroy({ where: { id, userId } });
    }

    async update(id: number, data: ReservationDto, userId) {
        const reservation = await this.reservationRepository.findOne({
            where: { id, userId },
        });
        if (!reservation) {
            throw new NotFoundException('Бронь не найдена');
        }
        if (reservation.status === 'Active' && data.status === 'Canceled') {
            const ticket = await Ticket.findByPk(reservation.ticketId);
            if (!ticket) {
                throw new NotFoundException(`Ticket with ID ${reservation.ticketId} not found`);
            }
            ticket.status = 'Available';
            await ticket.save();
        }
        const [numberOfAffectedRows, [updatedReservation]] =
          await this.reservationRepository.update(
            { ...data, ticketId: data.ticketId, userId },
            { where: { id, userId }, returning: true });
        return { numberOfAffectedRows, updatedReservation };
    }

    async cancelReservation(id: number, userId: number): Promise<Reservation> {
        const reservation = await this.reservationRepository.findOne({
            where: { id, userId },
        });
        if (!reservation) {
            throw new NotFoundException('Бронь не найдена');
        }
        if (reservation.status !== 'Active') {
            throw new BadRequestException('Можно отменить только активные брони');
        }
        reservation.status = 'Canceled';
        await reservation.save();
        const ticket = await Ticket.findByPk(reservation.ticketId);
        if (!ticket) {
            throw new NotFoundException(`Ticket with ID ${reservation.ticketId} not found`);
        }
        ticket.status = 'Available';
        await ticket.save();
        return reservation;
    }

    async findByUserId(userId: number): Promise<Reservation[]> {
        const reservations = await this.reservationRepository.findAll({
            where: { userId },
        });
        if (reservations.length === 0) {
            throw new NotFoundException(`No reservations found for user with ID ${userId}`);
        }
        return reservations;
    }

    async findByTicketId(ticketId: number): Promise<Reservation> {
        const reservation = await this.reservationRepository.findOne({
            where: { ticketId },
        });
        if (!reservation) {
            throw new NotFoundException(`No reservation found for ticket with ID ${ticketId}`);
        }
        return reservation;
    }

  async getActiveReservationsCountByUser(): Promise<Record<number, number>> {
    const [results] = await this.sequelize.query(`
    SELECT "userId", COUNT(*) as count
    FROM "Reservations"
    WHERE "status" = 'Active'
    GROUP BY "userId"
  `);

    const counts: Record<number, number> = {};
    for (const row of results as any[]) {
      counts[row.userId] = Number(row.count);
    }

    return counts;
  }
}
