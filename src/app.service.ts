import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import configuration from './config/configuration';

@Injectable()
export class AppService {
  constructor(
    @Inject(configuration.KEY)
    private configService: ConfigType<typeof configuration>,
  ) { }

  getHello(): string {
    const apiKey = this.configService.googleMapsApiKey;
    const sender = this.configService.emailSenderAddress;

    console.log(`Usando la API Key de Google: ${apiKey}`);
    console.log(`Enviando correos desde: ${sender}`);

    return '¡Hola Mundo con configuración!';
  }
}