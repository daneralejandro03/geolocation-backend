import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { EmailService } from '../email/email.service';
import { createHash } from 'crypto'; // Importar de crypto


@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) { }

  /**
   * Registra un nuevo usuario en el sistema.
   * @param registerDto - Datos del usuario para el registro.
   */
  async register(registerDto: RegisterAuthDto) {
    const existingUser = await this.userService.findOneByEmail(
      registerDto.email,
    );
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está en uso');
    }

    const user = await this.userService.create(registerDto);

    // No devolvemos la contraseña en la respuesta
    const { password, ...result } = user;
    return result;
  }

  /**
   * Inicia sesión de un usuario y devuelve un token JWT.
   * @param loginDto - Credenciales de inicio de sesión.
   */
  async login(loginDto: LoginAuthDto) {
    const user = await this.userService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordMatching = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: user.idUser,
      email: user.email,
      name: user.name,
      rol: user.rol,
    };

    return {
      message: 'Inicio de sesión exitoso',
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Genera un token de recuperación y lo envía por correo.
   * @param email - Correo del usuario que solicita la recuperación.
   */
  async requestPasswordRecovery(email: string) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      // Por seguridad, no revelamos si el correo existe o no.
      // Puedes optar por no hacer nada o lanzar un error genérico.
      // En este caso, simplemente retornamos para no dar pistas.
      return;
    }

    // 1. Generar un token simple y su hash
    const recoveryToken = Math.floor(100000 + Math.random() * 900000).toString(); // PIN de 6 dígitos
    const hashedToken = createHash('sha256').update(recoveryToken).digest('hex');

    // 2. Establecer fecha de expiración (ej. 10 minutos)
    const recoveryTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 3. Guardar el token hasheado en el usuario
    await this.userService.update(user.idUser, {
      recoveryToken: hashedToken,
      recoveryTokenExpiresAt,
    });

    // 4. Enviar el PIN por correo (¡enviamos el token sin hashear!)
    await this.emailService.sendPasswordRecoveryPin(user, recoveryToken); // Necesitarás crear este método en EmailService

    return { message: 'Si el correo existe, se ha enviado un PIN de recuperación.' };
  }

  
  /**
   * Restablece la contraseña usando un token de recuperación.
   * @param token - El PIN que el usuario ingresó.
   * @param newPassword - La nueva contraseña.
   */
  async resetPassword(token: string, newPassword: string) {
    // 1. Hashear el token recibido para buscarlo en la BD
    const hashedToken = createHash('sha256').update(token).digest('hex');

    // 2. Buscar usuario por el token y verificar que no haya expirado
    const user = await this.userService.findOneByRecoveryToken(hashedToken);

    if (!user || !user.recoveryTokenExpiresAt || user.recoveryTokenExpiresAt < new Date()) {
      throw new UnauthorizedException('El PIN es inválido o ha expirado.');
    }

    // 3. Actualizar la contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userService.update(user.idUser, {
      password: hashedPassword,
      recoveryToken: null,
      recoveryTokenExpiresAt: null,
    });

    return { message: 'Contraseña actualizada exitosamente.' };
  }
}