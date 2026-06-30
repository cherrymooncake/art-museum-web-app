import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

enum Category {
    DRAWING = 'Drawing',
    SCULPTURE = 'Sculpture',
    PHOTOGRAPHY = 'Photography',
    PRINTMAKING = 'Printmaking',
    TEXTILE = 'Textile',
    CERAMIC = 'Ceramic',
}

export class ArtworkDto {
    @IsNotEmpty()
    readonly title: string;

    @IsNotEmpty()
    readonly author: string;

    @IsNotEmpty()
    readonly description: string;

    @IsNotEmpty()
    readonly yearCreated: string;

    @IsNotEmpty()
    @IsEnum(Category, {
        message: 'Category must be Drawing, Sculpture, Photography, Printmaking, Textile, or Ceramic',
    })
    readonly category: Category;

    @IsOptional()
    readonly imagePath?: string;

    @IsNotEmpty()
    @IsNumber()
    readonly exhibitionId: number;
}
