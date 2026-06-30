import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';

import { Ticket } from '../tickets/ticket.entity';
import { Artwork } from '../artworks/artwork.entity';

@Table
export class Exhibition extends Model<Exhibition> {
    @Column({
        type: DataType.TEXT,
        allowNull: false,
        unique: true,
    })
    title: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    description: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    startDate: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    endDate: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    imagePath: string;

    @HasMany(() => Ticket, {
        onDelete: 'CASCADE',
        hooks: true,
    })
    tickets: Ticket[];

    @HasMany(() => Artwork, {
        onDelete: 'CASCADE',
        hooks: true,
    })
    artworks: Artwork[];
}
