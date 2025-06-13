import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator';

/**
 * DTO para el registro de un nuevo usuario.
 * Define la estructura y validaciones de los datos requeridos.
 */
export class RegisterAuthDto {
    @ApiProperty({
        description: 'Nombre completo del usuario',
        example: 'Usuario nombre',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Correo electrónico del usuario (debe ser único)',
        example: 'usuario.nuevo@correo.com',
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Contraseña para el nuevo usuario (mínimo 6 caracteres)',
        example: 'passwordSegura123',
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password: string;
}