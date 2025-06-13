import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador personalizado para extraer el objeto `user` de la solicitud (request).
 * Esto es posible gracias a que JwtStrategy adjunta el usuario a la solicitud.
 */
export const GetUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);
