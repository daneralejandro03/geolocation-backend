import {
  Injectable,
  Inject,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { EmailClient, EmailMessage } from '@azure/communication-email';
import configuration from 'src/config/configuration';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private emailClient: EmailClient;
  private senderAddress: string;

  constructor(
    @Inject(configuration.KEY)
    private readonly configService: ConfigType<typeof configuration>,
  ) {
    const connectionString = this.configService.emailConnectionString;
    this.senderAddress = this.configService.emailSenderAddress as string;

    if (!connectionString || !this.senderAddress) {
      this.logger.error(
        'Las variables de entorno para el servicio de email no están configuradas.',
      );
      throw new InternalServerErrorException(
        'Faltan credenciales para el servicio de correo.',
      );
    }

    this.emailClient = new EmailClient(connectionString);
  }

  /**
   * Envía un correo de notificación de nueva ubicación a un seguidor.
   * @param recipient - El usuario seguidor que recibirá el correo.
   * @param trackedUser - El usuario que ha compartido su ubicación.
   * @param latitude - La latitud de la nueva ubicación.
   * @param longitude - La longitud de la nueva ubicación.
   */
  async sendLocationNotification(
    recipient: User,
    trackedUser: User,
    latitude: number,
    longitude: number,
  ): Promise<void> {
    // URL formateada correctamente para Google Maps
    const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

    const emailMessage: EmailMessage = {
      senderAddress: this.senderAddress,
      content: {
        subject: `Nueva ubicación de ${trackedUser.name}`,
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h1 style="color: #333;">¡${trackedUser.name} ha compartido una nueva ubicación!</h1>
                <p>Hola ${recipient.name},</p>
                <p>El usuario <strong>${trackedUser.name}</strong>, a quien sigues, ha reportado una nueva ubicación.</p>
                <p>Puedes verla en el mapa haciendo clic en el siguiente enlace:</p>
                <p style="text-align: center;">
                  <a href="${googleMapsUrl}" target="_blank" style="background-color: #4285F4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Ver ubicación en Google Maps
                  </a>
                </p>
                <br>
                <p><b>Coordenadas:</b><br>Latitud: ${latitude}<br>Longitud: ${longitude}</p>
                <hr>
                <p style="font-size: 12px; color: #777;">Este es un correo automático, por favor no respondas.</p>
              </div>
            </body>
          </html>
        `,
      },
      recipients: {
        to: [{ address: recipient.email }],
      },
    };

    try {
      this.logger.log(`Enviando correo a ${recipient.email}...`);
      const poller = await this.emailClient.beginSend(emailMessage);
      await poller.pollUntilDone();
      this.logger.log(`Correo enviado exitosamente a ${recipient.email}`);
    } catch (error) {
      this.logger.error(
        `Fallo al enviar correo a ${recipient.email}`,
        error.stack,
      );
    }
  }


  /**
   * Envía un PIN de recuperación de contraseña.
   * @param recipient - El usuario que recibirá el correo.
   * @param pin - El PIN de 6 dígitos.
   */
  async sendPasswordRecoveryPin(recipient: User, pin: string): Promise<void> {
    const emailMessage: EmailMessage = {
      senderAddress: this.senderAddress,
      content: {
        subject: `Tu PIN de recuperación de contraseña`,
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h1 style="color: #333;">Recuperación de Contraseña</h1>
                <p>Hola ${recipient.name},</p>
                <p>Hemos recibido una solicitud para restablecer tu contraseña. Usa el siguiente PIN para continuar. Este PIN expirará en 10 minutos.</p>
                <p style="text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; background-color: #f0f0f0; padding: 15px; border-radius: 5px;">
                  ${pin}
                </p>
                <br>
                <p>Si no solicitaste esto, puedes ignorar este correo de forma segura.</p>
                <hr>
                <p style="font-size: 12px; color: #777;">Este es un correo automático, por favor no respondas.</p>
              </div>
            </body>
          </html>
        `,
      },
      recipients: {
        to: [{ address: recipient.email }],
      },
    };

    try {
      this.logger.log(`Enviando PIN de recuperación a ${recipient.email}...`);
      const poller = await this.emailClient.beginSend(emailMessage);
      await poller.pollUntilDone();
      this.logger.log(`PIN enviado exitosamente a ${recipient.email}`);
    } catch (error) {
      this.logger.error(
        `Fallo al enviar PIN a ${recipient.email}`,
        error.stack,
      );
    }
  }
}