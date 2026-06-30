import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Ticket } from '../tickets/ticket.entity';
import { User } from '../users/user.entity';

@Table
export class Reservation extends Model<Reservation> {
    @Column({
        type: DataType.ENUM,
        values: ['Active', 'Canceled'],
        defaultValue: 'Active',
        allowNull: false,
    })
    status: string;

    @Column({
        type: DataType.ENUM,
        values: ['Adult', 'Child', 'Student', 'Senior'],
        defaultValue: 'Adult',
        allowNull: false,
    })
    type: string;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    totalPrice: number;

    @ForeignKey(() => Ticket)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    ticketId: number;

    @BelongsTo(() => Ticket, {
        onDelete: 'CASCADE',
        hooks: true,
    })
    ticket: Ticket;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    userId: number;

    @BelongsTo(() => User, {
        onDelete: 'CASCADE',
        hooks: true,
    })
    user: User;
}
