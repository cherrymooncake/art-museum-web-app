import {
    Injectable,
    Inject,
    BadRequestException, NotFoundException,
} from '@nestjs/common';
import { Artwork } from './artwork.entity';
import { ArtworkDto } from './dto/artwork.dto';
import { Exhibition } from '../exhibitions/exhibition.entity';
import { ARTWORK_REPOSITORY } from '../../core/constants';
import { Op } from 'sequelize';

@Injectable()
export class ArtworksService {
    constructor(
      @Inject(ARTWORK_REPOSITORY)
      private readonly artworkRepository: typeof Artwork,
    ) {}

    async create(artwork: ArtworkDto): Promise<Artwork> {
        const existingArtwork = await this.artworkRepository.findOne({
            where: { title: artwork.title }});
        if (existingArtwork) {
            throw new BadRequestException('Экспонат с таким названием уже существует');
        }
        return await this.artworkRepository.create<Artwork>({
            ...artwork,
            exhibitionId: artwork.exhibitionId,
        });
    }

    async findAll(): Promise<Artwork[]> {
        return await this.artworkRepository.findAll<Artwork>({
            include: [Exhibition],
        });
    }

    async findOne(id): Promise<Artwork> {
        return await this.artworkRepository.findOne({
            where: { id },
            include: [Exhibition],
        });
    }

    async findByTitle(title: string): Promise<Artwork[]> {
        return await this.artworkRepository.findAll({
            where: {
                title: {
                    [Op.iLike]: `%${title}%`,
                },
            },
            include: { all: true },
        });
    }

    async findByCategory(category: string): Promise<Artwork[]> {
        return await this.artworkRepository.findAll({
            where: {
                category,
            },
        });
    }

    async getCategories(): Promise<string[]> {
        const artworks = await this.artworkRepository.findAll();
        const categories = artworks.map(artwork => artwork.category);
        return [...new Set(categories)];
    }

    async delete(id: number) {
        return await this.artworkRepository.destroy({ where: { id } });
    }

    async update(id: number, data: ArtworkDto) {
        const [numberOfAffectedRows, [updatedArtwork]] =
          await this.artworkRepository.update(
            { ...data, exhibitionId: data.exhibitionId },
            { where: { id }, returning: true },
          );

        return { numberOfAffectedRows, updatedArtwork };
    }

    async setImagePath(id: number, imagePath: string): Promise<Artwork> {
        const artwork = await this.artworkRepository.findByPk(id);
        if (!artwork) {
            throw new NotFoundException('Artwork not found');
        }
        artwork.imagePath = imagePath;
        return artwork.save();
    }
}
