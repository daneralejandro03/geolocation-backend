import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { UserModule } from 'src/user/user.module';
import { HttpModule } from '@nestjs/axios';
import { FollowUpModule } from 'src/follow-up/follow-up.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Location]), UserModule, HttpModule, FollowUpModule, EmailModule],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [LocationService, TypeOrmModule],
})
export class LocationModule { }
