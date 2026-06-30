import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException, UseGuards, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ArtworksService } from './artworks.service';
import { Artwork as ArtworkEntity } from './artwork.entity';
import { ArtworkDto } from './dto/artwork.dto';
import { Exhibition } from '../exhibitions/exhibition.entity';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/guards/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('artworks')
export class ArtworksController {
    constructor(private readonly artworksService: ArtworksService) { }

    @Get()
    async findAll() {
        return await this.artworksService.findAll();
    }

    @Get(':id(\\d+)')
    async findOne(@Param('id') id: number): Promise<ArtworkEntity> {
        const artwork = await this.artworksService.findOne(id);
        if (!artwork) {
            throw new NotFoundException('This Artwork doesn\'t exist');
        }
        return artwork;
    }

    @Get('search')
    async findByTitle(@Query('title') title: string): Promise<ArtworkEntity[]> {
        if (!title) {
            throw new NotFoundException('Search query "title" is required');
        }

        return await this.artworksService.findByTitle(title);
    }

    @Get('category/:category')
    async filterByCategory(@Param('category') category: string): Promise<ArtworkEntity[]> {
        return await this.artworksService.findByCategory(category);
    }

    @Get('categories')
    async getCategories(): Promise<string[]> {
        return this.artworksService.getCategories();
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @Post()
    async create(@Body() artwork: ArtworkDto): Promise<ArtworkEntity> {
        const exhibition = await Exhibition.findByPk(artwork.exhibitionId);
        if (!exhibition) {
            throw new NotFoundException(`Exhibition with ID ${artwork.exhibitionId} not found`);
        }
        return await this.artworksService.create(artwork);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @Put(':id')
    async update(@Param('id') id: number, @Body() artwork: ArtworkDto): Promise<ArtworkEntity> {
        const exhibition = await Exhibition.findByPk(artwork.exhibitionId);
        if (!exhibition) {
            throw new NotFoundException(`Exhibition with ID ${artwork.exhibitionId} not found`);
        }
        const { numberOfAffectedRows, updatedArtwork: updatedArtwork } = await this.artworksService.update(id, artwork);

        if (numberOfAffectedRows === 0) {
            throw new NotFoundException('This Artwork doesn\'t exist');
        }
        return updatedArtwork;
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @Delete(':id')
    async remove(@Param('id') id: number) {
        const deleted = await this.artworksService.delete(id);
        if (deleted === 0) {
            throw new NotFoundException('This Artwork doesn\'t exist');
        }
        return 'Successfully deleted';
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @Post(':id/upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/artworks',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            },
        }),
    }))
    async uploadImage(@Param('id') id: number, @UploadedFile() file: Express.Multer.File) {
        return this.artworksService.setImagePath(+id, file.path);
    }
}
