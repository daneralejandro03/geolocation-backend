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


  async getDistance(
    calculateDto: CalculateDistanceDto,
  ): Promise<{ distance: any; duration: any }> {
    const { lat1, lon1, lat2, lon2 } = calculateDto;
    const apiKey = this.configService.googleMapsApiKey;

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            destinations: `${lat2},${lon2}`,
            origins: `${lat1},${lon1}`,
            units: 'metric',
            key: apiKey,
          },
        }),
      );

      const data = response.data;

      if (data.status !== 'OK' || !data.rows[0].elements[0]) {
        throw new InternalServerErrorException(
          `Error de la API de Google: ${data.error_message || data.status}`,
        );
      }

      const element = data.rows[0].elements[0];

      if (element.status === 'ZERO_RESULTS') {
        throw new NotFoundException(
          'No se pudo encontrar una ruta entre los puntos proporcionados.',
        );
      }

      if (element.status !== 'OK') {
        throw new InternalServerErrorException(
          `No se pudo calcular la ruta entre los puntos. Estado: ${element.status}`,
        );
      }

      return {
        distance: element.distance,
        duration: element.duration,
      };
    } catch (error) {
      console.error(
        'Error al llamar a la API de Google Maps:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        'No se pudo conectar con el servicio de Google Maps.',
      );
    }
  }
}