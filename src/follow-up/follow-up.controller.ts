import {
  Controller,
  Post,
  Delete,
  Param,
  Get,
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
import { FollowUpService } from './follow-up.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../user/entities/enumetations/role.enumeration';

@ApiTags('Follow-Up')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('followups')
export class FollowUpController {
  constructor(private readonly followUpService: FollowUpService) { }

  @Post(':followedId')
  @ApiOperation({ summary: 'Seguir a un usuario (Solo Admins)' })
  @ApiParam({ name: 'followedId', description: 'ID del usuario a seguir' })
  @ApiResponse({ status: 201, description: 'Seguimiento creado exitosamente.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado (No es ADMIN).' })
  @ApiResponse({ status: 404, description: 'Usuario a seguir no encontrado.' })
  @ApiResponse({ status: 409, description: 'Conflicto (ya sigues a este usuario).' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  create(
    @GetUser() follower: User,
    @Param('followedId', ParseIntPipe) followedId: number,
  ) {
    return this.followUpService.create(follower, followedId);
  }

  @Delete(':followedId')
  @ApiOperation({ summary: 'Dejar de seguir a un usuario (Solo Admins)' })
  @ApiParam({
    name: 'followedId',
    description: 'ID del usuario que se dejará de seguir',
  })
  @ApiResponse({
    status: 200,
    description: 'Se ha dejado de seguir al usuario.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado (No es ADMIN).' })
  @ApiResponse({ status: 404, description: 'No se encontró el seguimiento.' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  remove(
    @GetUser() follower: User,
    @Param('followedId', ParseIntPipe) followedId: number,
  ) {
    return this.followUpService.remove(follower, followedId);
  }

  @Get('following')
  @ApiOperation({
    summary: 'Obtener la lista de usuarios que estoy siguiendo (Solo Admins)',
  })
  @ApiResponse({
    status: 200,
    description: 'Devuelve una lista de los usuarios seguidos.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado (No es ADMIN).' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findMyFollowing(@GetUser() user: User) {
    return this.followUpService.findMyFollowing(user);
  }

  @Get('followers')
  @ApiOperation({ summary: 'Obtener la lista de usuarios que me siguen' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve una lista de los seguidores.',
  })
  findMyFollowers(@GetUser() user: User) {
    return this.followUpService.findMyFollowers(user);
  }
}
