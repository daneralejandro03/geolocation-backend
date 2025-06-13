import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import configuration from '../config/configuration';
import { User } from '../user/entities/user.entity';
import { Role } from '../user/entities/enumetations/role.enumeration'; // Importa el enum Role

// --- ¡DEFINIMOS EL TIPO DEL PAYLOAD AQUÍ! ---
// Así tenemos un tipado fuerte y claro de lo que contiene nuestro token.
interface JwtPayload {
    sub: number;
    email: string;
    name: string;
    rol: Role; // Usamos el enum para el rol
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject(configuration.KEY)
        private configService: ConfigType<typeof configuration>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {
        if (!configService.jwtSecret) {
            throw new Error('JWT secret is not defined');
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.jwtSecret,
        });
    }

    /**
     * Método de validación que se ejecuta después de que el token es verificado.
     * @param payload - El contenido decodificado del JWT, ahora con tipado fuerte.
     * @returns El usuario completo si se encuentra, o lanza una excepción.
     */
    async validate(payload: JwtPayload) {
        const user = await this.userRepository.findOneBy({ idUser: payload.sub });

        if (!user) {
            throw new UnauthorizedException('Token no válido');
        }

        // El objeto que se retorna aquí se adjuntará a `request.user`
        const { password, ...result } = user;
        return result;
    }
}