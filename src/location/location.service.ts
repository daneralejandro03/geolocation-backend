import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { Location } from './entities/location.entity';
import { User } from '../user/entities/user.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { CalculateDistanceDto } from './dto/calculate-distance.dto';
import configuration from 'src/config/configuration';
import { EmailService } from '../email/email.service';
import { FollowUpService } from '../follow-up/follow-up.service';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    private readonly httpService: HttpService,
    @Inject(configuration.KEY)
    private readonly configService: ConfigType<typeof configuration>,
    private readonly followUpService: FollowUpService,
    private readonly emailService: EmailService,
  ) { }

  async create(
    user: User,
    createLocationDto: CreateLocationDto,
  ): Promise<Location> {
    const newLocation = this.locationRepository.create({
      ...createLocationDto,
      user,
    });

    const savedLocation = await this.locationRepository.save(newLocation);

    const followers = await this.followUpService.findMyFollowers(user);

    if (followers && followers.length > 0) {
      console.log(
        `Enviando notificaciones por correo a ${followers.length} seguidores.`,
      );
      followers.forEach((follower) => {
        this.emailService.sendLocationNotification(
          follower,
          user,
          savedLocation.latitude,
          savedLocation.longitude,
        );
      });
    }

    return savedLocation;
  }

  async findAllByUserId(userId: number): Promise<Location[]> {
    const locations = await this.locationRepository.find({
      where: { user: { idUser: userId } },
      order: { timestamp: 'DESC' },
    });

    if (!locations || locations.length === 0) {
      throw new NotFoundException(
        `No se encontraron localizaciones para el usuario con ID #${userId}`,
      );
    }

    return locations;
  }

  /**
   * Calcula la distancia, duración y la ruta codificada (polyline) entre dos puntos
   * utilizando la API de Directions de Google Maps.
   * @param calculateDto DTO con las coordenadas de origen y destino.
   * @returns Un objeto con distancia, duración y la polyline de la ruta.
   */
  async getDistance(
    calculateDto: CalculateDistanceDto,
  ): Promise<{ distance: any; duration: any; polyline: string }> {
    const { lat1, lon1, lat2, lon2 } = calculateDto;
    const apiKey = this.configService.googleMapsApiKey;

    const url = `https://maps.googleapis.com/maps/api/directions/json`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            origin: `${lat1},${lon1}`,
            destination: `${lat2},${lon2}`,
            key: apiKey,
          },
        }),
      );

      const data = response.data;

      if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
        throw new InternalServerErrorException(
          `Error de la API de Google Directions: ${data.error_message || data.status
          }`,
        );
      }

      const route = data.routes[0];
      const leg = route.legs[0];

      if (!leg || !leg.distance || !leg.duration) {
        throw new NotFoundException(
          'No se pudo encontrar una ruta entre los puntos proporcionados.',
        );
      }

      return {
        distance: leg.distance,
        duration: leg.duration,
        polyline: route.overview_polyline.points,
      };

    } catch (error) {
      console.error(
        'Error al llamar a la API de Google Maps (Directions):',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        'No se pudo conectar con el servicio de Google Maps.',
      );
    }
  }
}
