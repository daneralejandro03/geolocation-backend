import { Module } from '@nestjs/common';
import { FollowUpService } from './follow-up.service';
import { FollowUpController } from './follow-up.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowUp } from './entities/follow-up.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FollowUp]),
    UserModule,
  ],
  controllers: [FollowUpController],
  providers: [FollowUpService],
  exports: [FollowUpService, TypeOrmModule],
})
export class FollowUpModule { }
