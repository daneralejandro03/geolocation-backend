import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @ApiProperty({
        description: 'El PIN de 6 dígitos recibido por correo electrónico',
        example: '123456',
    })
    @IsNotEmpty()
    @IsString()
    token: string;

    @ApiProperty({
        description: 'La nueva contraseña para el usuario (mínimo 6 caracteres)',
        example: 'nuevaPasswordSegura123',
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
    newPassword: string;
}