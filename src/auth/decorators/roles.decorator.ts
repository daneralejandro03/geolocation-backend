import { SetMetadata } from '@nestjs/common';
import { Role } from '../../user/entities/enumetations/role.enumeration';

/**
 * La clave que usaremos para almacenar los metadatos de los roles.
 */
export const ROLES_KEY = 'roles';

/**
 * Decorador para asignar los roles requeridos a un endpoint específico.
 * @param roles - Una lista de roles que tienen permiso para acceder.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
