function mostrarTareas({ arrTareas, mostrarModalConfirmEdit, mostrarModalConfirmDelete }) {
  const listaTareas = document.getElementById('listaTareas');
  listaTareas.innerHTML = '';

  arrTareas.forEach((tarea, index) => {
    const li = document.createElement('li');
    li.classList.add("tarea");
    li.textContent = tarea;

    const btnEliminar = document.createElement('button');
    const btnEditar = document.createElement('button');

    btnEditar.textContent = '✏️';
    btnEditar.classList.add("btnEditar");
    btnEliminar.textContent = '🗑';
    btnEliminar.classList.add("btnEliminar");

    btnEliminar.onclick = () => {
      mostrarModalConfirmDelete(() => {
        arrTareas.splice(index, 1);
        localStorage.setItem('tareas', JSON.stringify(arrTareas));
        mostrarTareas({ arrTareas, mostrarModalConfirmEdit, mostrarModalConfirmDelete });
      });
    };

    btnEditar.onclick = () => {
      mostrarModalConfirmEdit(tarea, (nuevaTarea) => {
        arrTareas[index] = nuevaTarea;
        localStorage.setItem('tareas', JSON.stringify(arrTareas));
        mostrarTareas({ arrTareas, mostrarModalConfirmEdit, mostrarModalConfirmDelete });
      });
    };

    const div = document.createElement('div');
    div.appendChild(btnEditar);
    div.appendChild(btnEliminar);
    li.appendChild(div);

    listaTareas.appendChild(li);
  });
}
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/serviceWorker.js")
      .then((res) => console.log("service worker registered"))
      .catch((err) => console.log("service worker not registered", err));
  });
}


const container = document.querySelector(".container");
const btnAgregar = document.querySelector("#btnAgregar");

let arrTareas = JSON.parse(localStorage.getItem('tareas')) || [];



// Modal de edición reutilizable
function mostrarModalConfirmEdit(valorActual, onConfirm) {
  const modal = document.getElementById('modalConfirmEdit');
  const btnNo = document.getElementById('btnModalNoEdit');
  const inputEdit = document.getElementById('inputEdit');
  const btnSi = document.getElementById('btnModalSiEdit');
  modal.classList.add('active');
  inputEdit.value = valorActual;
  btnSi.onclick = null;
  btnNo.onclick = null;
  btnSi.onclick = () => {
    const nuevaTarea = inputEdit.value.trim();
    if (nuevaTarea) {
      modal.classList.remove('active');
      onConfirm(nuevaTarea);
    }
  };
  btnNo.onclick = () => {
    console.log('Cancelar edición');
    modal.classList.remove('active');
  };
}

// Modal de confirmación de borrado reutilizable
function mostrarModalConfirmDelete(onConfirm) {
  const modal = document.getElementById('modalConfirmDelete');
  const btnNo = document.getElementById('btnModalNoDelete');
  const btnSi = document.getElementById('btnModalSiDelete');

  modal.classList.add('active');
  btnSi.onclick = null;
  btnNo.onclick = null;

  btnSi.onclick = () => {
    modal.classList.remove('active');
    onConfirm();
  };

  btnNo.onclick = () => {
    modal.classList.remove('active');
  };
}

function renderTareas() {
  mostrarTareas({ arrTareas, mostrarModalConfirmEdit, mostrarModalConfirmDelete });
}




btnAgregar.addEventListener("click", () => {
  const tarea = document.querySelector("#iptTarea").value;
  if (tarea.trim() !== "") {
    arrTareas.push(tarea);
    localStorage.setItem('tareas', JSON.stringify(arrTareas));
    renderTareas();
    document.querySelector("#iptTarea").value = "";
  }
});





document.addEventListener("DOMContentLoaded", renderTareas);

