// ================= FUNCIONES OFFLINE =================

console.log("Cargando funciones de fusión offline...");

function guardarOperacionPendiente(operacion) {
  const pendientes = JSON.parse(localStorage.getItem("pendientes")) || [];
  pendientes.push(operacion);
  localStorage.setItem("pendientes", JSON.stringify(pendientes));
}

function procesarPendientes() {
  const pendientes = JSON.parse(localStorage.getItem("pendientes")) || [];
  if (pendientes.length === 0) return;

  console.log("Procesando operaciones pendientes:", pendientes);

  let mapaIds = JSON.parse(localStorage.getItem("mapaIds")) || {};

  const promesas = pendientes.map(op => {
    if (op.tipo === "POST") {
      return fetch("https://f77b786697d6.ngrok-free.app/tareas", {
        method: "POST",
        headers: { "Content-Type": "application/json","ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({ descripcion: op.descripcion })
      })
      .then(res => res.json())
      .then(data => {
        if (op.idTemporal) {
          mapaIds[op.idTemporal] = data.id;
          localStorage.setItem("mapaIds", JSON.stringify(mapaIds));
        }
      });
    }

    if (op.tipo === "DELETE") {
      const idReal = mapaIds[op.id] || op.id;
      return fetch(`https://f77b786697d6.ngrok-free.app/tareas/${idReal}`, 
        { method: "DELETE",
            headers: { "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true"
             }
       });
    }

    if (op.tipo === "PUT") {
      const idReal = mapaIds[op.id] || op.id;
      return fetch(`https://f77b786697d6.ngrok-free.app/tareas/${idReal}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({ descripcion: op.descripcion })
      });
    }
  });

  Promise.all(promesas).then(() => {
    localStorage.removeItem("pendientes");
    cargarTareas(); // refresca desde servidor
  });
}

function hayConexion() {
  return navigator.onLine;
}

// ================= RENDERIZAR =================

function mostrarTareas({ arrTareas, mostrarModalConfirmEdit, mostrarModalConfirmDelete }) {
  const listaTareas = document.getElementById('listaTareas');
  listaTareas.innerHTML = '';

  arrTareas.forEach((tarea, index) => {
    const li = document.createElement('li');
    li.classList.add("tarea");
    li.textContent = tarea.descripcion || tarea;

    const btnEliminar = document.createElement('button');
    const btnEditar = document.createElement('button');

    btnEditar.textContent = '✏️';
    btnEditar.classList.add("btnEditar");
    btnEliminar.textContent = '🗑';
    btnEliminar.classList.add("btnEliminar");

    btnEliminar.onclick = () => {
      mostrarModalConfirmDelete(() => {
        if (!hayConexion()) {
          arrTareas.splice(index, 1);
          localStorage.setItem('tareas', JSON.stringify(arrTareas));
          guardarOperacionPendiente({ tipo: "DELETE", id: tarea.id });
          mostrarTareas({ arrTareas, mostrarModalConfirmEdit, mostrarModalConfirmDelete });
        } else {
          eliminarTarea(tarea.id);
        }
      });
    };

    btnEditar.onclick = () => {
      mostrarModalConfirmEdit(tarea.descripcion || tarea, (nuevaTarea) => {
        if (!hayConexion()) {
          arrTareas[index] = { ...tarea, descripcion: nuevaTarea };
          localStorage.setItem('tareas', JSON.stringify(arrTareas));
          guardarOperacionPendiente({ tipo: "PUT", id: tarea.id, descripcion: nuevaTarea });
          mostrarTareas({ arrTareas, mostrarModalConfirmEdit, mostrarModalConfirmDelete });
        } else {
          editarTarea(tarea.id, nuevaTarea);
        }
      });
    };

    const div = document.createElement('div');
    div.appendChild(btnEditar);
    div.appendChild(btnEliminar);
    li.appendChild(div);

    listaTareas.appendChild(li);
  });
}

// ================= CRUD ONLINE =================

function cargarTareas() {
  if (!hayConexion()) {
    console.log("Sin internet, mostrando desde localStorage");
    const arrTareas = JSON.parse(localStorage.getItem("tareas")) || [];
    mostrarTareas({ arrTareas, mostrarModalConfirmEdit, mostrarModalConfirmDelete });
    return;
  }

  fetch("https://f77b786697d6.ngrok-free.app/tareas", { headers: { "ngrok-skip-browser-warning": "true","Content-Type":"application/json" } })
    .then(res => res.json())
    .then(arrTareas => {
      localStorage.setItem("tareas", JSON.stringify(arrTareas));
      mostrarTareas({ arrTareas, mostrarModalConfirmEdit, mostrarModalConfirmDelete });
    })
    .catch(err => console.error("Error en cargarTareas:", err));
}

function agregarTarea(descripcion) {
  if (!hayConexion()) {
    console.log("Sin conexión, guardando tarea local");
    const arrTareas = JSON.parse(localStorage.getItem('tareas')) || [];
    const idTemporal = "tmp-" + Date.now();
    const nuevaTarea = { id: idTemporal, descripcion };
    arrTareas.push(nuevaTarea);
    localStorage.setItem("tareas", JSON.stringify(arrTareas));
    guardarOperacionPendiente({ tipo: "POST", idTemporal, descripcion });
    mostrarTareas({ arrTareas, mostrarModalConfirmEdit, mostrarModalConfirmDelete });
    return;
  }

  fetch("https://f77b786697d6.ngrok-free.app/tareas", {
    method: "POST",
    headers: { "ngrok-skip-browser-warning": "true", "Content-Type":"application/json" },
    body: JSON.stringify({ descripcion })
  })
    .then(res => res.json())
    .then(() => cargarTareas());
}

function eliminarTarea(id) {
  fetch(`https://f77b786697d6.ngrok-free.app/tareas/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" } })
    .then(() => cargarTareas());
}

function editarTarea(id, descripcion) {
  fetch(`https://f77b786697d6.ngrok-free.app/tareas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true", "Content-Type":"application/json" },
    body: JSON.stringify({ descripcion })
  })
    .then(() => cargarTareas());
}

// ================= EVENTOS =================

const btnAgregar = document.querySelector("#btnAgregar");

btnAgregar.addEventListener("click", () => {
  const tarea = document.querySelector("#iptTarea").value;
  if (tarea.trim() !== "") {
    agregarTarea(tarea);
    document.querySelector("#iptTarea").value = "";
  }
});

window.addEventListener("online", procesarPendientes);
document.addEventListener("DOMContentLoaded", () => {
  cargarTareas();
  procesarPendientes();
});

// ================= MODALES =================

function mostrarModalConfirmEdit(valorActual, onConfirm) {
  const modal = document.getElementById('modalConfirmEdit');
  const btnNo = document.getElementById('btnModalNoEdit');
  const inputEdit = document.getElementById('inputEdit');
  const btnSi = document.getElementById('btnModalSiEdit');

  modal.classList.add('active');
  inputEdit.value = valorActual;

  btnSi.disabled = false;
  btnNo.disabled = false;

  btnSi.onclick = () => {
    btnSi.disabled = true;
    btnNo.disabled = true;
    const nuevaTarea = inputEdit.value.trim();
    if (nuevaTarea) {
      modal.classList.remove('active');
      onConfirm(nuevaTarea);
    }
  };

  btnNo.onclick = () => {
    btnSi.disabled = true;
    btnNo.disabled = true;
    modal.classList.remove('active');
  };
}

function mostrarModalConfirmDelete(onConfirm) {
  const modal = document.getElementById('modalConfirmDelete');
  const btnNo = document.getElementById('btnModalNoDelete');
  const btnSi = document.getElementById('btnModalSiDelete');

  modal.classList.add('active');

  btnSi.disabled = false;
  btnNo.disabled = false;

  btnSi.onclick = () => {
    btnSi.disabled = true;
    btnNo.disabled = true;
    modal.classList.remove('active');
    onConfirm();
  };

  btnNo.onclick = () => {
    btnSi.disabled = true;
    btnNo.disabled = true;
    modal.classList.remove('active');
  };
}

// ================= SERVICE WORKER =================

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("./serviceWorker.js")
      .then((res) => console.log("service worker registered"))
      .catch((err) => console.log("service worker not registered", err));
  });
}
