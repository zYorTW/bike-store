// Definición de variables
const url = "http://localhost:3600/api/ventafiltradas";
const contenedor = document.querySelector("tbody");
const fechaInicial = document.getElementById("fecha_Inicial");
const fechaFinal = document.getElementById("fecha_Final");

//Boton para filtrar las ventras entre las dos fechas.
const btnFiltrar = document.getElementById("ventas_Filtro");
//Boton para filtrar los productos mas vendidos.
const btnProductos = document.getElementById("productos_Filtro");
//Boton para volver.
const volver = document.getElementById("btnVolver");

//Volver al panel del administrador
volver.addEventListener("click", function () {
  window.location.href = "index-admin.html";
});

// Funcion para mostrar o listar los resultados de las ventas obtenidas de la base de datos
const mostrarVentas = (ventas) => {
  contenedor.innerHTML = ""; // limpiar la tabla

  if (ventas.length === 0) {
    // mmensaje en caso de datos vacios
    contenedor.innerHTML = `
            <tr>
                <td colspan="6">No exiten ventas en el período seleccionado </td>
            </tr>
        `;
    return;
  }

  ventas.forEach((venta) => {
    contenedor.innerHTML += `
        <tr>
            <td>${venta.cliente}</td>
            <td>${venta.producto}</td>
            <td>${new Date(venta.fecha).toLocaleDateString()}</td>
            <td>${venta.dirección}</td> <!-- Ahora existe -->
            <td>${venta.metodo_pago}</td> <!-- Ahora existe -->
            <td>${venta.cantidad}</td>
            <td>$${venta.total.toFixed(2)}</td>
        </tr>
    `;
  });
};

// Función para mostrar productos más vendidos (HU19)
const mostrarProductosVendidos = (productos) => {
  contenedor.innerHTML = "";
  const tablaHeader = document.querySelector("#tablaHeader");
  tablaHeader.innerHTML = ` 
      <tr>
          <th>Producto</th>
          <th>Cantidad Vendida</th>
      </tr>
  `;

  if (productos.length === 0) {
      contenedor.innerHTML = `<tr><td colspan="2">No se encontraron productos</td></tr>`;
      return;
  }

  productos.forEach((producto) => {
      contenedor.innerHTML += `
          <tr>
              <td>${producto.nombre}</td>
              <td>${producto.total_vendido}</td>
          </tr>
      `;
  });
};

// Escuchador del botón (versión mejorada)
btnProductos.addEventListener("click", async () => {
    try {
        const response = await fetch("http://localhost:3600/api/productos/mas-vendidos");
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error en la solicitud");
        }
        
        const data = await response.json();
        console.log("Datos recibidos:", data); // Verificar en consola
        mostrarProductosVendidos(data);
        
    } catch (error) {
        console.error("Error completo:", error);
        alert(`Error: ${error.message}`);
    }
});

//Filtrar por un rango de fechas
btnFiltrar.addEventListener("click", () => {
  const filtroUrl = `${url}?fechaInicio=${fechaInicial.value}&fechaFin=${fechaFinal.value}`;

  fetch(filtroUrl)
    .then(async (response) => {
      if (!response.ok) {
        // Extrae mensaje de error del backend
        const err = await response.json();
        throw err;
      }
      return response.json();
    })
    // llamado a la funcion que carga los datos:
    .then((data) => mostrarVentas(data))
    .catch((error) => {
      // muestra una alerta para errores críticos
      alert(`Error: ${error.error || "Hubo un fallo en la conexión"}`);
    });

  document.querySelector("#tablaHeader").innerHTML = `
        <tr>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Producto</th>
            <th>Dirección</th>
            <th>Metodo de pago</th>
            <th>Cantidad</th>
            <th>Total</th>
        </tr>
        `;
});

// Restaurar encabezados originales al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#tablaHeader").innerHTML = `
        <tr>
            <th class="visually-hidden">ID</th>
            <th>Cliente</th>
            <th>Producto</th>
            <th>Fecha</th>
            <th>Dirección</th>
            <th>Metodo de pago</th>
            <th>Cantidad</th>
            <th>Total</th>
        </tr>
    `;
});
