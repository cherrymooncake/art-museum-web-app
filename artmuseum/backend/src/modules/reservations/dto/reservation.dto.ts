import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

enum Status {
    ACTIVE = 'Active',
    CANCELED = 'Canceled',
}

enum Type {
    ADULT = 'Adult',
    CHILD = 'Child',
    STUDENT = 'Student',
    SENIOR = 'Senior',
}

export class ReservationDto {
    @IsNotEmpty()
    @IsEnum(Status, {
        message: 'Status must be Active or Canceled',
    })
    readonly status: Status;

    @IsNotEmpty()
    @IsEnum(Type, {
        message: 'Type must be Adult, Child, Student, or Senior',
    })
    readonly type: Type;

    readonly totalPrice?: number;

    @IsNotEmpty()
    @IsNumber()
    readonly ticketId: number;
}
