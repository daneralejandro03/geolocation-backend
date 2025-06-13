import { ApiProperty } from '@nestjs/swagger';
import { IsLatitude, IsLongitude, IsNotEmpty } from 'class-validator';

export class CalculateDistanceDto {
    @ApiProperty({
        description: 'Latitud del primer punto (origen)',
        example: 4.8133, // Ejemplo: Latitud de Manizales
    })
    @IsNotEmpty()
    @IsLatitude()
    lat1: number;

    @ApiProperty({
        description: 'Longitud del primer punto (origen)',
        example: -75.496, // Ejemplo: Longitud de Manizales
    })
    @IsNotEmpty()
    @IsLongitude()
    lon1: number;

    @ApiProperty({
        description: 'Latitud del segundo punto (destino)',
        example: 4.60971, // Ejemplo: Bogotá
    })
    @IsNotEmpty()
    @IsLatitude()
    lat2: number;

    @ApiProperty({
        description: 'Longitud del segundo punto (destino)',
        example: -74.08175, // Ejemplo: Bogotá
    })
    @IsNotEmpty()
    @IsLongitude()
    lon2: number;
}
