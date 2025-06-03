const socket = io("https://socket-monitor.onrender.com");

// Cuando llega la lista completa
socket.on("actualizar_usuarios", function(lista) {
  const contenedor = document.getElementById("usuarios-activos");
  contenedor.innerHTML = ''; // limpiar antes de repintar

  lista.forEach(data => {
    const item = document.createElement("li");
    item.className = "list-group-item d-flex flex-column";

    item.innerHTML = `
      <div><strong>IP:</strong> 🌐 ${data.ip}</div>
      <div><strong>País:</strong> 🌍 ${data.pais}</div>
      <div><strong>Navegador:</strong> 🧭 ${data.navegador}</div>
      <div><strong>Página:</strong> 📄 <a href="${data.pagina}" target="_blank">${data.pagina}</a></div>
      <div><strong>Hora:</strong> 🕒 ${data.hora}</div>
    `;

    contenedor.appendChild(item);
  });
});

// Pedir la lista al entrar
socket.emit("get_usuarios_activos");
