import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  /**
   * Crea un nuevo usuario. Ahora también verifica si el email ya existe.
   * Acepta un rol opcional para ser creado por un administrador.
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email } = createUserDto;
    const existingUser = await this.userRepository.findOneBy({ email });

    if (existingUser) {
      throw new ConflictException(`El correo electrónico '${email}' ya está en uso.`);
    }

    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  /**
   * Devuelve todos los usuarios sin su contraseña.
   */
  async findAll(): Promise<Partial<Omit<User, 'password'>>[]> {
    const users = await this.userRepository.find();
    return users.map((user) => {
      const { password, ...result } = user;
      return result;
    });
  }

  // ... (los otros métodos como findOne, findOneByEmail, update, remove se mantienen igual)
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ idUser: id });
    if (!user) {
      throw new NotFoundException(`Usuario con ID #${id} no encontrado`);
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository.findOneBy({ email });
    return user ?? undefined;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.preload({
      idUser: id,
      ...updateUserDto,
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID #${id} no encontrado`);
    }
    return this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return { message: `Usuario con ID #${id} eliminado correctamente` };
  }

  async findOneByRecoveryToken(recoveryToken: string,): Promise<User | undefined> {
    const user = await this.userRepository.findOneBy({ recoveryToken });
    return user ?? undefined;
  }

  /**
   * Cambia la contraseña de un usuario autenticado.
   * @param userId - El ID del usuario que realiza la acción.
   * @param changePasswordDto - DTO con la contraseña actual y la nueva.
   */
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    // 1. Obtener el usuario completo desde la BD para acceder a su hash de contraseña
    const user = await this.userRepository.findOneBy({ idUser: userId });

    if (!user) {
      // Este caso es poco probable si el token es válido, pero es una buena práctica
      throw new NotFoundException(`Usuario con ID #${userId} no encontrado`);
    }

    // 2. Verificar que la contraseña actual es correcta
    const isPasswordMatching = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordMatching) {
      throw new BadRequestException('La contraseña actual es incorrecta.');
    }

    // 3. Opcional: Verificar que la nueva contraseña no sea igual a la anterior
    if (changePasswordDto.newPassword === changePasswordDto.currentPassword) {
      throw new BadRequestException('La nueva contraseña no puede ser igual a la actual.');
    }

    // 4. Hashear y actualizar la nueva contraseña.
    // La entidad User tiene un hook @BeforeInsert pero no @BeforeUpdate para el hash.
    // Por lo tanto, hasheamos manualmente aquí.
    const newHashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.userRepository.update(userId, { password: newHashedPassword });

    return { message: 'Contraseña actualizada correctamente.' };
  }
}
