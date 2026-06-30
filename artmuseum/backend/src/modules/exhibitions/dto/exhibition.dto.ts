import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class ExhibitionDto {

    @IsNotEmpty()
    readonly title: string;

    @IsNotEmpty()
    readonly description: string;

    @IsNotEmpty()
    startDate: string;

    @IsNotEmpty()
    endDate: string;

    @IsOptional()
    readonly imagePath?: string;
}
