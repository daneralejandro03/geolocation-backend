import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../user/entities/enumetations/role.enumeration';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { CalculateDistanceDto } from './dto/calculate-distance.dto';

@ApiTags('Locations')
@ApiBearerAuth() // Indica que todos los endpoints en este controlador requieren un token
@UseGuards(JwtAuthGuard)
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) { }

  @Post()
  @ApiOperation({
    summary: 'Registrar la ubicación actual (Solo para rol LOCATION)',
  })
  @ApiResponse({
    status: 201,
    description: 'Ubicación registrada exitosamente.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado (No tiene el rol LOCATION).',
  })
  @UseGuards(RolesGuard)
  @Roles(Role.LOCATION)
  create(
    @GetUser() user: User,
    @Body() createLocationDto: CreateLocationDto,
  ) {
    return this.locationService.create(user, createLocationDto);
  }

  @Get(':userId')
  @ApiOperation({
    summary: 'Obtener el historial de ubicaciones de un usuario (Solo Admins)',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario cuyo historial se quiere consultar',
  })
  @ApiResponse({
    status: 200,
    description: 'Devuelve el historial de ubicaciones del usuario.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado (No es ADMIN).' })
  @ApiResponse({
    status: 404,
    description: 'No se encontraron ubicaciones para el usuario.',
  })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findAllByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.locationService.findAllByUserId(userId);
  }

  @Post('distance')
  @ApiOperation({ summary: 'Calcular distancia entre dos puntos (Google Maps)' })
  @ApiResponse({ status: 201, description: 'Cálculo exitoso.', type: CalculateDistanceDto })
  @ApiResponse({ status: 500, description: 'Error al conectar con la API de Google.' })
  getDistance(@Body() calculateDistanceDto: CalculateDistanceDto) {
    return this.locationService.getDistance(calculateDistanceDto);
  }
}
