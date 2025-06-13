import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { INestApplication } from '@nestjs/common';

/**
 * Adaptador personalizado de WebSockets para configurar explícitamente las opciones de CORS.
 * Esto asegura que las conexiones desde clientes como Postman o navegadores sean aceptadas.
 */
export class SocketIoAdapter extends IoAdapter {
    constructor(app: INestApplication) {
        super(app);
    }

    createIOServer(port: number, options?: ServerOptions): any {
        const server = super.createIOServer(port, {
            ...options,
            cors: {
                origin: '*', // Permite conexiones desde cualquier origen
                methods: ['GET', 'POST'],
                credentials: true,
            },
        });
        return server;
    }
}
