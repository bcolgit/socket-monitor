
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const usuariosActivos = {}; // socket.id -> usuario

io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado:', socket.id);

  socket.on('datos_usuario', (data) => {
    usuariosActivos[socket.id] = {
      ...data,
      hora: new Date().toLocaleTimeString(),
      ultimaActualizacion: Date.now()
    };

    io.emit('actualizar_usuarios', Object.values(usuariosActivos));
  });

  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado:', socket.id);
    delete usuariosActivos[socket.id];
    io.emit('actualizar_usuarios', Object.values(usuariosActivos));
  });

  socket.on('get_usuarios_activos', () => {
    socket.emit('actualizar_usuarios', Object.values(usuariosActivos));
  });
});

// Limpieza de usuarios inactivos
setInterval(() => {
  const ahora = Date.now();
  for (const [id, user] of Object.entries(usuariosActivos)) {
    if (ahora - user.ultimaActualizacion > 20000) { // 20 segundos sin actividad
      console.log('🕓 Usuario inactivo removido:', id);
      delete usuariosActivos[id];
    }
  }
  io.emit('actualizar_usuarios', Object.values(usuariosActivos));
}, 10000); // revisar cada 10 segundos

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Servidor Socket.IO escuchando en puerto ${PORT}`);
});
