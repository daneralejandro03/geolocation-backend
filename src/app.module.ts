import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { environments } from './config/environments';
import { validationSchema } from './config/validation.schema';
import configuration from './config/configuration';

import { User } from './user/entities/user.entity';
import { Location } from './location/entities/location.entity';
import { FollowUp } from './follow-up/entities/follow-up.entity';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { FollowUpModule } from './follow-up/follow-up.module';
import { LocationModule } from './location/location.module';
import { GeolocationServiceModule } from './geolocation-service/geolocation-service.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: environments[process.env.NODE_ENV as string],
      load: [configuration],
      isGlobal: true,
      validationSchema,
    }),

    TypeOrmModule.forRootAsync({
      inject: [configuration.KEY],
      useFactory: (configService: ConfigType<typeof configuration>) => {
        const { host, port, username, password, database } =
          configService.database;
        return {
          type: 'mysql',
          host,
          port,
          username,
          password,
          database,
          entities: [User, Location, FollowUp],
          synchronize: true,
        };
      },
    }),

    AuthModule,
    UserModule,
    FollowUpModule,
    LocationModule,
    GeolocationServiceModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }