import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayDisconnect,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConnectedClientsService } from './connected-clients.service';
import { UserService } from '../user/user.service';
import { FollowUpService } from '../follow-up/follow-up.service';
import { CreateLocationDto } from '../location/dto/create-location.dto';
import { Role } from '../user/entities/enumetations/role.enumeration';

@WebSocketGateway({
    namespace: '/geolocation',
    cors: { origin: '*' },
})
export class GeolocationGateway
    implements OnGatewayInit, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    constructor(
        private readonly jwtService: JwtService,
        private readonly connectedClientsService: ConnectedClientsService,
        private readonly userService: UserService,
        private readonly followUpService: FollowUpService,
    ) { }

    // Middleware que se ejecuta para cada nuevo socket que intenta conectar.
    afterInit(server: Server) {
        server.use(async (socket: Socket, next: (err?: Error) => void) => {
            console.log('[Middleware] Autenticando nueva conexión...');
            try {
                const token = socket.handshake.headers.authorization?.split(' ')[1];
                if (!token) {
                    throw new Error('Falta el token en los headers.');
                }

                const payload: any = this.jwtService.verify(token);
                const user = await this.userService.findOne(payload.sub);
                if (!user) {
                    throw new Error('El usuario del token no existe.');
                }

                // El usuario es válido, lo registramos.
                this.connectedClientsService.add(user, socket);

                // La conexión es exitosa, permitimos que continúe.
                next();
            } catch (err) {
                console.error('[Middleware] ❌ Fallo de autenticación:', err.message);
                // La conexión es rechazada.
                next(new Error('Unauthorized'));
            }
        });
    }

    // Ahora, este método solo se ejecuta si el middleware tuvo éxito.
    handleConnection(socket: Socket) {
        const user = this.connectedClientsService.getUserBySocketId(socket.id);
        if (user) {
            console.log(`[Gateway] ✅ Cliente conectado y autenticado: ${user.name} (${socket.id})`);
        }
    }

    handleDisconnect(socket: Socket) {
        this.connectedClientsService.remove(socket.id);
    }

    // Este método ahora funciona de forma fiable.
    @SubscribeMessage('sendLocation')
    async handleSendLocation(
        @ConnectedSocket() socket: Socket,
        @MessageBody() locationDto: CreateLocationDto,
    ) {
        const user = this.connectedClientsService.getUserBySocketId(socket.id);

        if (!user) {
            // Este caso ya no debería ocurrir gracias al middleware, pero es una buena guarda.
            return { error: 'Error: Usuario no encontrado para este socket.' };
        }
        if (user.rol !== Role.LOCATION) {
            return { error: 'Acción no permitida para este rol.' };
        }

        const followers = await this.followUpService.findMyFollowers(user);
        console.log(`[Gateway] Ubicación de ${user.name} recibida. Notificando a ${followers.length} seguidores.`);

        followers.forEach((followerAdmin) => {
            const adminSocket = this.connectedClientsService.getSocketByUserId(followerAdmin.idUser);
            if (adminSocket) {
                this.server.to(adminSocket.id).emit('newLocation', {
                    userId: user.idUser,
                    name: user.name,
                    ...locationDto,
                    timestamp: new Date(),
                });
            }
        });

        return { success: true, message: 'Ubicación enviada.' };
    }
}