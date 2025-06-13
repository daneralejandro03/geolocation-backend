import { ApiProperty } from '@nestjs/swagger';
import { IsLatitude, IsLongitude, IsNotEmpty } from 'class-validator';

/**
 * DTO para la creación de un nuevo registro de localización.
 * Define la estructura y validaciones de los datos de coordenadas.
 */
export class CreateLocationDto {
    @ApiProperty({
        description: 'Latitud geográfica del usuario',
        example: 4.8133, // Ejemplo: Latitud de Manizales, Colombia
    })
    @IsNotEmpty({ message: 'La latitud no puede estar vacía' })
    @IsLatitude({ message: 'El valor proporcionado no es una latitud válida' })
    latitude: number;

    @ApiProperty({
        description: 'Longitud geográfica del usuario',
        example: -75.496, // Ejemplo: Longitud de Manizales, Colombia
    })
    @IsNotEmpty({ message: 'La longitud no puede estar vacía' })
    @IsLongitude({ message: 'El valor proporcionado no es una longitud válida' })
    longitude: number;
}
