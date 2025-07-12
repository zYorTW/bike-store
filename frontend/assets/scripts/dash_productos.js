// Definición de variables
const url = 'http://localhost:3600/api/productos';
const contenedor = document.querySelector('tbody');
const modal = document.getElementById('modalProducto');
const formProductos = document.querySelector('form');
const nombre = document.getElementById('product_nombre');
const precio = document.getElementById('product_precio');
const descripcion = document.getElementById('product_descripcion');
const imagen = document.getElementById('product_imagen');
const marca = document.getElementById('product_marca');
const categoria = document.getElementById('product_categoria');
const destacado = document.getElementById('product_destacado');
const entradas = document.getElementById('product_entradas');
const btnCrear = document.getElementById('btnCrear');
const closeBtn = document.querySelector('.close');
const closeBtnSecondary = document.querySelector('.btn-secondary');
let volver = document.getElementById('btnVolver');
let opcion = '';
let idForm = 0;
let stockInicial;

//Volver al panel del administrador
volver.addEventListener('click', function () {
    window.location.href = 'index-admin.html';
})

// Funcioness del modal
btnCrear.onclick = function () {
    console.log("tocando el boton de crear")
    modal.style.display = "block";
    opcion = 'crear';
    nombre.value = '';
    precio.value = '';
    descripcion.value = '';
    document.getElementById('product_imagen').value = '';
    marca.value = '';
    categoria.value = '';
    destacado.value = '';
    entradas.value = '';
};

closeBtn.onclick = function () {
    modal.style.display = "none";
}

closeBtnSecondary.onclick = function () {
    modal.style.display = "none";
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Funcion para mostrar o listar los resultados obtenidos de la base de datos

const mostrar = (productos) => {
    contenedor.innerHTML = '';
    productos.forEach(productos => {
        const esDestacado = productos.destacado ? "Si" : "No";
        contenedor.innerHTML += `
            <tr>
                <td class="visually-hidden">${productos.id}</td>
                <td>${productos.nombre}</td>
                <td>${productos.precio}</td>
                <td>${productos.descripcion}</td>
                <td>${productos.marca}</td>
                <td>${productos.categoria}</td>
                <td>${esDestacado}</td>
                <td>${productos.entradas}</td>
                <td>${productos.salidas}</td>
                <td>${productos.stock}</td>
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
    .then(response => response.json())
    .then(data => mostrar(data))
    .catch(error => console.log(error))

// Funcion para manejar eventos delegados
const on = (element, event, selector, handler) => {
    element.addEventListener(event, e => {
        if (e.target.closest(selector)) {
            handler(e)
        };
    });
};

// procedimiento para borrar
on(document, 'click', '.btnBorrar', e => {
    const fila = e.target.closest('tr');
    const id = fila.cells[0].textContent;

    if (confirm('¿Estas seguro de eliminar este registro?')) {
        fetch(`${url}/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error en la respuesta del servidor");
                }
                return response.json();
            })
            .then(() => {
                fila.remove();
            })
            .catch(error => {
                console.error('Error:', error);
                alert(`Hubo un error al tratar de eliminar el registro`);
            });
    };
});

// Procedimiento para actualizar registros:

on(document, 'click', '.btnEditar', e => {
    const fila = e.target.closest('tr');
    idForm = fila.cells[0].textContent;
    nombre.value = fila.cells[1].textContent;
    precio.value = fila.cells[2].textContent;
    descripcion.value = fila.cells[3].textContent;
    marca.value = fila.cells[4].textContent;
    categoria.value = fila.cells[5].textContent;
    destacado.value = fila.cells[6].textContent.toLowerCase() === 'si' ? true : false; // Convertir a booleano
    //CAPTURAR STOCK ACTUAL Y CONFIGURAR INPUT
    entradasIniciales = parseInt(fila.cells[7].textContent); // Convertir a número
    entradas.value = ''; // Limpiar campo
    entradas.placeholder = `Entradas actuales: ${entradasIniciales} + Ingrese cantidad a sumar`;
    opcion = 'editar';
    modal.style.display = "block";

})

// Procedimiento para crear y editar
formProductos.addEventListener('submit', (e) => {
    e.preventDefault();

    /*formData.append() es un método que se usa en JavaScript para agregar datos a un paquete llamado FormData. 
    Este paquete sirve para enviar información (como textos o archivos) a un servidor, por ejemplo, al enviar un formulario en una página web.*/
    const formData = new FormData();
    formData.append('nombre', nombre.value);
    formData.append('precio', precio.value);
    formData.append('descripcion', descripcion.value);
    formData.append('imagen', imagen.files[0]); // Esto es importante para el archivo
    formData.append('marca', marca.value);
    formData.append('categoria', categoria.value);
    formData.append('destacado', destacado.checked); 

    if (opcion === 'editar') {
        const incremento = parseInt(entradas.value) || 0; // Convertir a número o 0 si está vacío
        const nuevoStock = entradasIniciales + incremento;
        formData.append('entradas', nuevoStock);
    } else {
        formData.append('entradas', entradas.value);
    }

    const method = opcion === 'crear' ? 'POST' : 'PUT';
    const endPoint = opcion === 'crear' ? url : `${url}/${idForm}`;

    fetch(endPoint, {
        method: method,
        body: formData // Eliminamos el Content-Type header
    })
        .then(response => response.json())
        .then(data => {
            if (opcion === 'crear') {
                const nuevoProducto = [data];
                mostrar(nuevoProducto);
                alert("Producto creado exitosamente");
                //Se recarga la pagina para ver los cambios
                location.reload(); // Recargar para ver cambios
            } else {
                fetch(url)
                    .then(response => response.json())
                    .then(data => mostrar(data));
            }
            modal.style.display = "none";
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un error en procesar la solicitud')
        });
});
