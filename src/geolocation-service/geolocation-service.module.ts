import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { FollowUpModule } from 'src/follow-up/follow-up.module';
import { GeolocationGateway } from './geolocation.gateway';
import { ConnectedClientsService } from './connected-clients.service';

@Module({
  imports: [
    AuthModule,
    UserModule,
    FollowUpModule,
  ],
  providers: [GeolocationGateway, ConnectedClientsService],
})
export class GeolocationServiceModule { }
