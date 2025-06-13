import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsEmail,
    MinLength,
    IsNotEmpty,
    IsEnum,
    IsOptional,
} from 'class-validator';
import { Role } from '../entities/enumetations/role.enumeration';

/**
 * DTO para la creación de usuarios por parte de un administrador.
 * Define la estructura y validaciones de los datos requeridos.
 */
export class CreateUserDto {
    @ApiProperty({
        description: 'Nombre completo del nuevo usuario',
        example: 'Nuevo Usuario Admin',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Correo electrónico del nuevo usuario (debe ser único)',
        example: 'admin.nuevo@correo.com',
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Contraseña para el nuevo usuario (mínimo 6 caracteres)',
        example: 'passwordAdmin123',
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password: string;

    @ApiProperty({
        description:
            'Rol asignado al nuevo usuario. Si no se especifica, se usará el rol por defecto (LOCATION).',
        enum: Role,
        required: false, // Indica que es opcional en la UI de Swagger
        example: Role.ADMIN,
    })
    @IsOptional()
    @IsEnum(Role, { message: 'El rol proporcionado no es válido' })
    rol?: Role;

    recoveryToken?: string | null;

    recoveryTokenExpiresAt?: Date | null;


}
