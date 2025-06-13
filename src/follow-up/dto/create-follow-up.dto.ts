import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateFollowUpDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    followedId: number;
}
