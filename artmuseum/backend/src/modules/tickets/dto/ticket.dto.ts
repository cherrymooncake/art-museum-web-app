import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

enum Status {
    AVAILABLE = 'Available',
    BOOKED = 'Booked',
    UNAVAILABLE = 'Unavailable',
}

export class TicketDto {

    @IsNotEmpty()
    readonly date: string;

    @IsNotEmpty()
    @IsEnum(Status, {
        message: 'Type must be Available, Booked or Unavailable',
    })
    readonly status: Status;

    @IsNotEmpty()
    readonly price: number;

    @IsNotEmpty()
    @IsNumber()
    readonly exhibitionId: number;
}
