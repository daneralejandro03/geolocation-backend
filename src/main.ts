import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigType } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import configuration from './config/configuration';
import { SocketIoAdapter } from './adapters/socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useWebSocketAdapter(new SocketIoAdapter(app)); // <-- 2. Activa el adaptador


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('API de Geolocalización')
    .setDescription(
      'Documentación completa de la API para el servicio de geolocalización en tiempo real.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document); // La UI estará disponible en http://localhost:3000/api

  const configService = app.get<ConfigType<typeof configuration>>(
    configuration.KEY,
  );
  const port = configService.port;

  await app.listen(port);

  console.log(`La aplicación está corriendo en: ${await app.getUrl()}`);
  console.log(`Documentación de la API disponible en: ${await app.getUrl()}/api`);
}
bootstrap();
