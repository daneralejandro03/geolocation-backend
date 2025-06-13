import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Un guard que se puede usar en los controladores para proteger rutas,
 * requiriendo un token JWT válido para poder acceder.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }
