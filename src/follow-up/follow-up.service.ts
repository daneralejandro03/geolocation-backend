import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowUp } from './entities/follow-up.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class FollowUpService {
  constructor(
    @InjectRepository(FollowUp)
    private readonly followUpRepository: Repository<FollowUp>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  /**
   * Crea una relación de seguimiento entre dos usuarios.
   * @param follower - El usuario que realiza la acción de seguir (autenticado).
   * @param followedId - El ID del usuario que va a ser seguido.
   */
  async create(follower: User, followedId: number): Promise<FollowUp> {
    // 1. Verificar que el usuario no intente seguirse a sí mismo
    if (follower.idUser === followedId) {
      throw new BadRequestException('No puedes seguirte a ti mismo.');
    }

    // 2. Verificar que el usuario a seguir exista
    const followed = await this.userRepository.findOneBy({ idUser: followedId });
    if (!followed) {
      throw new NotFoundException(
        `El usuario con ID #${followedId} no existe.`,
      );
    }

    // 3. Verificar que la relación no exista ya
    const existingFollowUp = await this.followUpRepository.findOne({
      where: {
        follower: { idUser: follower.idUser },
        followed: { idUser: followedId },
      },
    });

    if (existingFollowUp) {
      throw new ConflictException('Ya estás siguiendo a este usuario.');
    }

    // 4. Crear y guardar la nueva relación
    const newFollowUp = this.followUpRepository.create({
      follower,
      followed,
    });

    return this.followUpRepository.save(newFollowUp);
  }

  /**
   * Elimina una relación de seguimiento.
   * @param follower - El usuario que realiza la acción de dejar de seguir.
   * @param followedId - El ID del usuario que se dejará de seguir.
   */
  async remove(follower: User, followedId: number): Promise<{ message: string }> {
    const followUp = await this.followUpRepository.findOne({
      where: {
        follower: { idUser: follower.idUser },
        followed: { idUser: followedId },
      },
    });

    if (!followUp) {
      throw new NotFoundException('No estás siguiendo a este usuario.');
    }

    await this.followUpRepository.remove(followUp);
    return { message: 'Has dejado de seguir a este usuario.' };
  }

  /**
   * Devuelve la lista de usuarios que el usuario autenticado está siguiendo.
   */
  async findMyFollowing(follower: User): Promise<User[]> {
    const followUps = await this.followUpRepository.find({
      where: { follower: { idUser: follower.idUser } },
      relations: ['followed'], // Carga la información completa del usuario seguido
    });

    return followUps.map((follow) => {
      const { password, ...result } = follow.followed;
      return result as User;
    });
  }

  /**
   * Devuelve la lista de usuarios que siguen al usuario autenticado.
   */
  async findMyFollowers(followed: User): Promise<User[]> {
    const followUps = await this.followUpRepository.find({
      where: { followed: { idUser: followed.idUser } },
      relations: ['follower'], // Carga la información completa del usuario seguidor
    });

    return followUps.map((follow) => {
      const { password, ...result } = follow.follower;
      return result as User;
    });
  }
}
