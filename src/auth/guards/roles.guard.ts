import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../../user/entities/enumetations/role.enumeration';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // Obtiene los roles requeridos del metadata del endpoint
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // Si no se especifican roles, se permite el acceso
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        // Obtiene el usuario que fue adjuntado a la solicitud por el JwtAuthGuard
        const { user }: { user: User } = context.switchToHttp().getRequest();

        // Si no hay usuario o no tiene rol, se niega el acceso
        if (!user || !user.rol) {
            throw new ForbiddenException('No tienes permisos para acceder a este recurso');
        }

        // Comprueba si el rol del usuario está en la lista de roles requeridos
        const hasPermission = requiredRoles.includes(user.rol);

        if (hasPermission) {
            return true;
        }

        // Si no tiene permiso, lanza una excepción
        throw new ForbiddenException(
            'No tienes los permisos necesarios para realizar esta acción',
        );
    }
}