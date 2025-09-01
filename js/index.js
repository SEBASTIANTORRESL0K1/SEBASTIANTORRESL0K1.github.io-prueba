

function mostrarTareas() {
    console.log("Llamando a /tareas...");
    fetch("http://localhost:3000/tareas")
        .then(res => res.json())
        .then(arrTareas => {
            // console.log("JSON recibido:", tareas);
            // tareas.forEach(tarea => console.log("Tarea:", tarea));
            const listaTareas = document.getElementById('listaTareas'); listaTareas.innerHTML = '';
            listaTareas.innerHTML = '';
            arrTareas.forEach((tarea, index) => {
                const li = document.createElement('li');
                li.classList.add("tarea");
                li.textContent = tarea.descripcion;
                li.id=`tarea-${tarea.id}`;

                const btnEliminar = document.createElement('button');
                const btnEditar = document.createElement('button');

                btnEditar.textContent = '✏️';
                btnEditar.classList.add("btnEditar");
                btnEditar.id = `editar-${tarea.id}`;
                btnEliminar.textContent = '🗑';
                btnEliminar.classList.add("btnEliminar");
                btnEliminar.id = `eliminar-${tarea.id}`;

                btnEliminar.onclick = () => {
                    mostrarModalConfirmDelete(() => {
                        // arrTareas.splice(index, 1);
                        // localStorage.setItem('tareas', JSON.stringify(arrTareas));
                        // mostrarTareas({ arrTareas, mostrarModalConfirmEdit, mostrarModalConfirmDelete });

                        eliminarTarea(tarea.id);

                    });
                };

                btnEditar.onclick = () => {
                    mostrarModalConfirmEdit(tarea, (nuevaTarea) => {
                       editarTarea(tarea.id,nuevaTarea);

                    });
                };

                const div = document.createElement('div');
                div.appendChild(btnEditar);
                div.appendChild(btnEliminar);
                li.appendChild(div);

                listaTareas.appendChild(li);
            });

        })
        .catch(err => console.error("Error en mostrarTareas:", err));
}

const btnAgregar = document.querySelector("#btnAgregar");

btnAgregar.addEventListener("click", () => {
    fetch("http://localhost:3000/tareas", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            descripcion: document.getElementById("iptTarea").value
        })
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("Error en la petición: " + res.status);
            }
            return res.json();
        })
        .then(data => {
            console.log("Tarea agregada:", data);
            document.getElementById("iptTarea").value = "";
            // refrescar listado de tareas después de agregar
            mostrarTareas();
        })
        .catch(err => console.error("Error:", err));
    mostrarTareas();
});

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
function eliminarTarea(id){
    fetch(`http://localhost:3000/tareas/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
        }
    )
    .then(res=>res.json())
    .then(resp=>{
        console.log("Tarea eliminada:", resp);
        mostrarTareas();
    })
}
function editarTarea(id,nuevaDescripcion){
    fetch(`http://localhost:3000/tareas/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({descripcion: nuevaDescripcion})
    })
    .then(res=>res.json())
    .then(resp=>{
        console.log("Tarea editada:", resp);
        mostrarTareas();
    })
}

function mostrarModalConfirmEdit(valorActual, onConfirm) {
  const modal = document.getElementById('modalConfirmEdit');
  const btnNo = document.getElementById('btnModalNoEdit');
  const inputEdit = document.getElementById('inputEdit');
  const btnSi = document.getElementById('btnModalSiEdit');
  modal.classList.add('active');
  inputEdit.value = valorActual.descripcion;
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

document.addEventListener("DOMContentLoaded", mostrarTareas);
