import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestRecoveryDto {
    @ApiProperty({
        description: 'Correo electrónico del usuario para recuperar la contraseña',
        example: 'usuario@correo.com',
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;
}