import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasOne, HasMany } from 'sequelize-typescript';

import { User } from '../users/user.entity';
import { Exhibition } from '../exhibitions/exhibition.entity';
import { Reservation } from '../reservations/reservation.entity';

@Table
export class Ticket extends Model<Ticket> {
    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    date: string;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    price: number;

    @Column({
        type: DataType.ENUM,
        values: ['Available', 'Booked', 'Unavailable'],
        defaultValue: 'Available',
        allowNull: false,
    })
    status: string;

    @ForeignKey(() => Exhibition)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    exhibitionId: number;

    @BelongsTo(() => Exhibition, {
        onDelete: 'CASCADE',
        hooks: true,
    })
    exhibition: Exhibition;

    @HasOne(() => Reservation, {
        onDelete: 'CASCADE',
        hooks: true,
    })
    reservation: Reservation;
}
