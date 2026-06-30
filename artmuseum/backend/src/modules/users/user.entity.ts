import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Reservation } from '../reservations/reservation.entity';

@Table
export class User extends Model<User> {
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name: string;

    @Column({
        type: DataType.STRING,
        unique: true,
        allowNull: false,
    })
    email: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    password: string;

    @Column({
        type: DataType.ENUM,
        values: ['male', 'female'],
        allowNull: false,
    })
    gender: string;

    @Column({
        type: DataType.ENUM,
        values: ['admin', 'visitor'],
        defaultValue: 'visitor',
        allowNull: false,
    })
    role: string;

    @HasMany(() => Reservation, {
        onDelete: 'CASCADE',
        hooks: true,
    })
    reservations: Reservation[];
}
