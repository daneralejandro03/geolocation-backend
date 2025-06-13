import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ConnectedClientsService {
  private readonly clientsByUserId: Record<string, Socket> = {};
  private readonly usersBySocketId: Record<string, User> = {}; // <-- Mapa clave para buscar usuario por socket

  /**
   * Registra un nuevo cliente y guarda la relación en ambos mapas.
   */
  add(user: User, socket: Socket) {
    this.clientsByUserId[user.idUser] = socket;
    this.usersBySocketId[socket.id] = user;
    console.log(`[Clients] Cliente registrado: ${user.name}`);
    console.log(user)
  }

  /**
   * Elimina un cliente de ambos mapas cuando se desconecta.
   */
  remove(socketId: string) {
    const user = this.usersBySocketId[socketId];
    if (user) {
      delete this.clientsByUserId[user.idUser];
      delete this.usersBySocketId[socketId];
      console.log(`[Clients] Cliente eliminado: ${user.name} (Socket ${socketId})`);
    }
  }

  /**
   * Obtiene el socket de un usuario por su ID.
   */
  getSocketByUserId(userId: number): Socket | undefined {
    return this.clientsByUserId[userId];
  }

  /**
   * Nuevo método para obtener el usuario a partir del ID del socket.
   * Esta es la forma más fiable de saber quién está enviando un mensaje.
   */
  getUserBySocketId(socketId: string): User | undefined {
    const user = this.usersBySocketId[socketId];
    console.log(`[Clients] Usuario obtenido por socket ${socketId}:`, user);
    return user;
  }
}