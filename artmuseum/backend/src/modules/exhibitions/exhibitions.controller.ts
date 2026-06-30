import { Controller, Get, Post, Put, Delete,
    Param, Body, NotFoundException, UseGuards, Request, Query, BadRequestException,
    UploadedFile, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { ExhibitionsService } from './exhibitions.service';
import { Exhibition as ExhibitionEntity } from './exhibition.entity';
import { ExhibitionDto } from './dto/exhibition.dto';
import { isAfter, isValid, parseISO, set, startOfDay } from 'date-fns';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/guards/roles.decorator';

@Controller('exhibitions')
export class ExhibitionsController {
    constructor(private readonly exhibitionService: ExhibitionsService) { }

    @Get()
    async findAll() {
        return await this.exhibitionService.findAll();
    }

    @Get(':id(\\d+)')
    async findOne(@Param('id') id: number): Promise<ExhibitionEntity> {
        const exhibition = await this.exhibitionService.findOne(id);

        if (!exhibition) {
            throw new NotFoundException('This Exhibition doesn\'t exist');
        }

        return exhibition;
    }

    @Get('search')
    async findByTitle(@Query('title') title: string): Promise<ExhibitionEntity[]> {
        if (!title) {
            throw new NotFoundException('Search query "title" is required');
        }

        return await this.exhibitionService.findByTitle(title);
    }

    @Get('filter/by-dates')
    async filterByDates(@Query('start') start: string, @Query('end') end: string) {
        const parsedStart = parseISO(start);
        const parsedEnd = parseISO(end);

        if (!isValid(parsedStart) || !isValid(parsedEnd)) {
            throw new BadRequestException('Invalid date format or non-existent date. Use YYYY-MM-DD.');
        }

        return await this.exhibitionService.findByDateRange(parsedStart, parsedEnd);
    }

    @Get('filter/by-date')
    async filterBySingleDate(@Query('date') date: string) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            throw new BadRequestException('Invalid date format. Use YYYY-MM-DD.');
        }

        return await this.exhibitionService.findBySingleDate(date);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @Post()
    async create(@Body() exhibition: ExhibitionDto): Promise<ExhibitionEntity> {
        const parsedStart = parseISO(exhibition.startDate);
        const parsedEnd = parseISO(exhibition.endDate);
        if (!isValid(parsedStart) || !isValid(parsedEnd)) {
            throw new BadRequestException('Invalid date format or non-existent date. Use YYYY-MM-DD.');
        }
        if (isAfter(parsedStart, parsedEnd)) {
            throw new BadRequestException('Start date must be before or equal to end date.');
        }
        return await this.exhibitionService.create(exhibition);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @Put(':id')
    async update(@Param('id') id: number, @Body() exhibition: ExhibitionDto): Promise<ExhibitionEntity> {
        const parsedStart = parseISO(exhibition.startDate);
        const parsedEnd = parseISO(exhibition.endDate);
        if (!isValid(parsedStart) || !isValid(parsedEnd)) {
            throw new BadRequestException('Invalid date format or non-existent date. Use YYYY-MM-DD.');
        }
        if (isAfter(parsedStart, parsedEnd)) {
            throw new BadRequestException('Start date must be before or equal to end date.');
        }
        const { numberOfAffectedRows, updatedExhibition } = await this.exhibitionService.update(id, exhibition);
        if (numberOfAffectedRows === 0) {
            throw new NotFoundException('This Exhibition doesn\'t exist');
        }
        return updatedExhibition;
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @Delete(':id')
    async remove(@Param('id') id: number) {
        const deleted = await this.exhibitionService.delete(id);
        if (deleted === 0) {
            throw new NotFoundException('This Exhibition doesn\'t exist');
        }
        return 'Successfully deleted';
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @Post(':id/upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/exhibitions',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            },
        }),
    }))
    async uploadImage(@Param('id') id: number, @UploadedFile() file: Express.Multer.File) {
        return this.exhibitionService.setImagePath(+id, file.path);
    }
}
