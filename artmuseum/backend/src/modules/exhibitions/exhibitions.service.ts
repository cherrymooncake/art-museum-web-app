import { Injectable, Inject, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { Exhibition } from './exhibition.entity';
import { ExhibitionDto } from './dto/exhibition.dto';
import { EXHIBITION_REPOSITORY } from '../../core/constants';
import { col, Op, where, fn, literal } from 'sequelize';
import { format } from 'date-fns';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class ExhibitionsService {
    constructor(@Inject(EXHIBITION_REPOSITORY) private readonly exhibitionRepository: typeof Exhibition) { }

    async create(exhibition: ExhibitionDto): Promise<Exhibition> {
        const existingExhibition = await this.exhibitionRepository.findOne({
            where: { title: exhibition.title }});
        if (existingExhibition) {
            throw new BadRequestException('Выставка с таким названием уже существует');
        }
        return await this.exhibitionRepository.create<Exhibition>({ ...exhibition});
    }

    async findAll(): Promise<Exhibition[]> {
        return await this.exhibitionRepository.findAll<Exhibition>();
    }

    async findOne(id): Promise<Exhibition> {
        return await this.exhibitionRepository.findOne({
            where: { id },
        });
    }

    async findByTitle(title: string): Promise<Exhibition[]> {
        return await this.exhibitionRepository.findAll({
            where: {
                title: {
                    [Op.iLike]: `%${title}%`,
                },
            },
            include: { all: true },
        });
    }

    async findByDateRange(startDate: Date, endDate: Date): Promise<Exhibition[]> {
        return await Exhibition.findAll({
            where: {
                startDate: {
                    [Op.lte]: endDate,
                },
                endDate: {
                    [Op.gte]: startDate,
                },
            },
        });
    }

    async findBySingleDate(dateStr: string): Promise<Exhibition[]> {
        return await Exhibition.findAll({
            where: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('DATE', Sequelize.col('startDate')), '<=', dateStr),
                    Sequelize.where(Sequelize.fn('DATE', Sequelize.col('endDate')), '>=', dateStr),
                ],
            },
        });
    }

    async delete(id) {
        return await this.exhibitionRepository.destroy({ where: { id } });
    }

    async update(id, data) {
        const [numberOfAffectedRows, [updatedExhibition]] = await this.exhibitionRepository.update({ ...data }, { where: { id }, returning: true });
        return { numberOfAffectedRows, updatedExhibition };
    }

    async setImagePath(id: number, imagePath: string): Promise<Exhibition> {
        const exhibition = await this.exhibitionRepository.findByPk(id);
        if (!exhibition) {
            throw new NotFoundException('Exhibition not found');
        }
        exhibition.imagePath = imagePath;
        return exhibition.save();
    }
}
