import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginAuthDto {
    @ApiProperty({
        description: 'Correo electrónico del usuario para iniciar sesión',
        example: 'usuario@correo.com',
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Contraseña del usuario (mínimo 6 caracteres)',
        example: 'password123',
    })
    @IsNotEmpty()
    @IsString()
    password: string;
}
