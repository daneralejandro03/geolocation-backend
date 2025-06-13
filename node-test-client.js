import { io } from 'socket.io-client';

// Reemplaza este token por uno válido generado por tu endpoint de /auth/login
const LOCATION_USER_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsImVtYWlsIjoiZGFuZXJhbGVqYW5kcm8wNEBnbWFpbC5jb20iLCJuYW1lIjoiQWxlamFuZHJvIENvbG9yYWRvIiwicm9sIjoiTE9DQVRJT04iLCJpYXQiOjE3NDk3MzU3NDQsImV4cCI6MTc0OTgyMjE0NH0.-KqlOYNYIXV-ITP1_aacoAxFW5sYo85hkJpqUU2bYUA'; // Token de un usuario con rol LOCATION
const ADMIN_USER_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiZGFuZXJhbGVqYW5kcm8wM0BnbWFpbC5jb20iLCJuYW1lIjoiRGFuZXIgU2FsYXphciIsInJvbCI6IkFETUlOIiwiaWF0IjoxNzQ5NzM1NjU4LCJleHAiOjE3NDk4MjIwNTh9.-PWkiRJc_HYE-Su_lhB1uENshGdcvml-kZ9w9vQ1pdU'; // Token de un usuario con rol ADMIN

function createClient(name, token) {
  console.log(`[${name}] Intentando conectar...`);

  const socket = io('http://localhost:3000/geolocation', {
    transports: ['websocket'],
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  socket.on('connect', () => {
    console.log(`[${name}] ✅ ¡Conectado al Gateway! ID: ${socket.id}`);

    // --- ¡AQUÍ ESTÁ LA SOLUCIÓN! ---
    // Solo si este cliente es el usuario de ubicación, envía la localización
    // DESPUÉS de haberse conectado exitosamente.
    if (name === 'Cliente LOCATION') {
      const locationData = {
        latitude: 4.8133,
        longitude: -75.496,
      };

      console.log(`[${name}] Enviando ubicación...`, locationData);
      socket.emit('sendLocation', locationData, (ack) => {
        console.log(`[${name}] ACK del servidor:`, ack);
      });
    }
  });

  socket.on('connect_error', (err) => {
    console.error(`[${name}] ❌ Error de conexión:`, err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log(`[${name}] ⚠️ Desconectado:`, reason);
  });

  // El admin escucha el evento 'newLocation'
  if (name === 'Cliente ADMIN') {
    socket.on('newLocation', (payload) => {
      console.log(
        `[${name}] 📍 ¡Nueva ubicación recibida de ${payload.name}!`,
        payload,
      );
    });
  }
}

// Inicia ambos clientes para la prueba completa
createClient('Cliente ADMIN', ADMIN_USER_TOKEN);
createClient('Cliente LOCATION', LOCATION_USER_TOKEN);
