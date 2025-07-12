// Definición de variables
const url = "http://localhost:3600/api/usuarios";
const contenedor = document.querySelector("tbody");
const modal = document.getElementById("modalCliente");
const formCliente = document.querySelector("form");
const nombre = document.getElementById("nombre");
const apellido = document.getElementById("apellido");
const cedula = document.getElementById("cedula");
const telefono = document.getElementById("telefono");
const correo = document.getElementById("correo");
const rol = document.getElementById("rol");
const contraseña = document.getElementById("contraseña");
const btnCrear = document.getElementById("btnCrear");
const closeBtn = document.querySelector(".close");
const closeBtnSecondary = document.querySelector(".btn-secondary");
let volver = document.getElementById("btnVolver");
let opcion = "";
let idForm = 0;

//Volver al panel del administrador
volver.addEventListener("click", function () {
  window.location.href = "index-admin.html";
});

// Funcioness del modal
btnCrear.onclick = function () {
  modal.style.display = "block";
  contraseña.disabled = false;
  contraseña.placeholder = "Ingrese nueva contraseña";
  opcion = "crear";
  nombre.value = "";
  apellido.value = "";
  cedula.value = "";
  telefono.value = "";
  correo.value = "";
  rol.value = "";
  contraseña.value = "";
};

closeBtn.onclick = function () {
  modal.style.display = "none";
};

closeBtnSecondary.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// Funcion para mostrar o listar los resultados obtenidos de la base de datos

const mostrar = (clientes) => {
  contenedor.innerHTML = "";
  clientes.forEach((cliente) => {
    contenedor.innerHTML += `
            <tr>
                <td class="visually-hidden"> ${cliente.id}</td>
                <td>${cliente.nombre}</td>
                <td>${cliente.apellido}</td>
                <td>${cliente.cedula}</td>
                <td>${cliente.telefono}</td>
                <td>${cliente.correo}</td>
                <td>${cliente.rol}</td>
                <td>
                    <button class = "btn btn-primary btnEditar">Editar</button>

                    <button class = "btn btn-danger btnBorrar">Borrar</button>
                </td>
            </tr>
        `;
  });
};

// Cargar Datos
fetch(url)
  .then((response) => response.json())
  .then((data) => mostrar(data))
  .catch((error) => console.log(error));

// Funcion para manejar eventos delegados
const on = (element, event, selector, handler) => {
  element.addEventListener(event, (e) => {
    if (e.target.closest(selector)) {
      handler(e);
    }
  });
};

// procedimiento para borrar
on(document, "click", ".btnBorrar", (e) => {
  const fila = e.target.closest("tr");
  const id = fila.cells[0].textContent;

  if (confirm("¿Estas seguro de eliminar este registro?")) {
    fetch(`${url}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error en la respuesta del servidor");
        }
        return response.json();
      })
      .then(() => {
        fila.remove();
      })
      .catch((error) => {
        console.error("Error:", error);
        alert(`Hubo un error al tratar de eliminar el registro`);
      });
  }
});

// Procedimiento para actualizar registros:

on(document, "click", ".btnEditar", (e) => {
  const fila = e.target.closest("tr");
  idForm = fila.cells[0].textContent;
  nombre.value = fila.cells[1].textContent;
  apellido.value = fila.cells[2].textContent;
  cedula.value = fila.cells[3].textContent;
  telefono.value = fila.cells[4].textContent;
  correo.value = fila.cells[5].textContent;
  rol.value = fila.cells[6].textContent;
  contraseña.disabled = true;
  contraseña.placeholder = "La contraseña no se puede editar aquí";
  opcion = "editar";
  modal.style.display = "block";
});

// Procedimiento para crear y editar
formCliente.addEventListener("submit", (e) => {
  e.preventDefault();

  //Esto verifica que en el campo cedula solo sean datos numericos
  if (isNaN(cedula.value)) {
    alert("El campo Cedula solo debe contener números");
    return;
  }

  //Esto verifica que en el campo Teléfono solo sean datos numericos
  if (isNaN(telefono.value)) {
    alert("El campo Teléfono solo debe contener números");
    return;
  }

  //Esto hace que el usuario solo pueda escribir un numero de telefono de 10 digitos
  if (telefono.value.length !== 10) {
    alert("El campo teléfono debe tener 10 digitos");
    return;
  }

  //Esto hace que el usuario solo pueda escribir un numero de cedula entre 8 y 10 digitos
  if (cedula.value.length < 8 || cedula.value.length > 10) {
    alert("El campo cedula debe tener entre 8 y 10 digitos");
    return;
  }

  // Se pone un condicional para poner un minimo de 8 digitos alfanumericos
  if (contraseña.value.length < 8) {
    alert("La contraseña debe tener al menos 8 caracteres");
    return;
  }

  const data = {
    nombre: nombre.value,
    apellido: apellido.value,
    cedula: cedula.value,
    telefono: telefono.value,
    correo: correo.value,
    rol: rol.value,
  };

  if (opcion === "crear") {
    data.contraseña = contraseña.value;
  }

  const method = opcion === "crear" ? "POST" : "PUT";
  const endPoint = opcion === "crear" ? url : `${url}/${idForm}`;

  fetch(endPoint, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) =>
      response.json().then((body) => ({
        status: response.status,
        body: body,
      }))
    )
    .then((data) => {
      if (opcion === "crear") {
        if (data.status === 409) {
          alert("Este correo ya está siendo utilizado en otra cuenta");
          return; // Salir si hay conflicto
        }

        const nuevoCliente = [data.body];
        mostrar(nuevoCliente);
      } else {
        fetch(url)
          .then((response) => response.json())
          .then((data) => mostrar(data));
      }
      modal.style.display = "none";
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Hubo un error en procesar la solicitud");
    });
});
