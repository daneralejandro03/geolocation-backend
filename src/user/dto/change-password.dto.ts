import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({
        description: 'La contraseña actual del usuario para verificación',
        example: 'passwordActual123',
    })
    @IsString()
    @IsNotEmpty({ message: 'La contraseña actual no puede estar vacía' })
    currentPassword: string;

    @ApiProperty({
        description: 'La nueva contraseña para el usuario (mínimo 6 caracteres)',
        example: 'nuevaPasswordSegura456',
    })
    @IsString()
    @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
    newPassword: string;
}