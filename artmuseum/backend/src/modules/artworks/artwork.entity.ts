import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Exhibition } from '../exhibitions/exhibition.entity';

@Table
export class Artwork extends Model<Artwork> {
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
    author: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    description: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    yearCreated: string;

    @Column({
        type: DataType.ENUM,
        values: ['Drawing', 'Sculpture', 'Photography', 'Printmaking', 'Textile', 'Ceramic'],
        defaultValue: 'Drawing',
        allowNull: false,
    })
    category: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    imagePath: string;

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
}
