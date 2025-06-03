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
      conectadoDesde: Date.now(),
      ultimaActualizacion: Date.now()
    };

    io.emit('actualizar_usuarios', Object.values(usuariosActivos));
  });

  socket.on('disconnect', () => {
    delete usuariosActivos[socket.id];
    io.emit('actualizar_usuarios', Object.values(usuariosActivos));
  });

  socket.on('get_usuarios_activos', () => {
    socket.emit('actualizar_usuarios', Object.values(usuariosActivos));
  });
});

// limpieza por inactividad (cada 10 seg)
setInterval(() => {
  const ahora = Date.now();
  for (const [id, user] of Object.entries(usuariosActivos)) {
    if (ahora - user.ultimaActualizacion > 20000) {
      delete usuariosActivos[id];
    }
  }
  io.emit('actualizar_usuarios', Object.values(usuariosActivos));
}, 10000);

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Servidor Socket.IO escuchando en puerto ${PORT}`);
});
