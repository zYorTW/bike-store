// =============================================
// VARIABLES GLOBALES
// =============================================
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// =============================================
// FUNCIONES DEL CARRITO
// =============================================

// Función para guardar el carrito en localStorage
function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

//Función que actualiza la interfaz visual del carrito de compras
function actualizarCarritoDOM() {

  const carritoMenu = document.querySelector('.carrito-menu'); //Contenedor principal del carrito (donde se muestran los productos)
  const contadorCarrito = document.querySelector('.count-carrito'); //Elemento que muestra el número total de ítems en el carrito (ej: icono con número)
  const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0); // Suma todas las cantidad de los productos en el array carrito
  contadorCarrito.textContent = totalItems; //Muestra el total de ítems en el icono del carrito (ej: "3" si hay 3 productos)
  
  carritoMenu.innerHTML = ''; //Vacía todo el contenido del carrito para reconstruirlo desde cero
  
  //Crea un encabezado con el texto "Tu Carrito" y o agrega al contenedor del carrito
  const titulo = document.createElement('h2');
  titulo.textContent = 'Tu Carrito';
  carritoMenu.appendChild(titulo);
  
  //paracerrar el boton
  const cerrarBtn = document.createElement('label');
  cerrarBtn.htmlFor = 'mostrar-el-carrito';
  cerrarBtn.className = 'cerrar-carrito';
  cerrarBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  carritoMenu.appendChild(cerrarBtn);
  
  //condicional para ver si hay productos en el carrito
  if (carrito.length === 0) {
    const mensaje = document.createElement('p');
    mensaje.textContent = 'No hay productos en el carrito';
    carritoMenu.appendChild(mensaje);
    return;
  }
  
// Crea un contenedor principal para la lista de productos del carrito
const listaProductos = document.createElement('div');
listaProductos.className = 'lista-productos';  // Clase CSS para estilizar la lista

// Recorre cada producto en el array del carrito
carrito.forEach((producto, index) => {
    // Crea un contenedor para cada item/producto
    const item = document.createElement('div');
    item.className = 'item-carrito';  // Clase para estilos individuales de cada producto
    
    // Crea seccion para la info basica del producto
    const infoProducto = document.createElement('div');
    infoProducto.className = 'item-info';  // Contenedor flex para nombre y precio
    
    // Elemento para mostrar el nombre del producto
    const nombre = document.createElement('h3');
    nombre.textContent = producto.nombre;  // Obtiene nombre del objeto producto
    
    // Elemento para mostrar el precio total (precio unitario * cantidad)
    const precio = document.createElement('p');
    precio.className = 'item-precio';  // Clase para estilizar el precio
    precio.textContent = `$${(producto.precio * producto.cantidad).toFixed(2)}`;  // Calculo y formateo a 2 decimales
    
    // Agrega nombre y precio al contenedor de info
    infoProducto.appendChild(nombre);
    infoProducto.appendChild(precio);
    
    // Crea contenedor para los controles de cantidad (+/-)
    const controles = document.createElement('div');
    controles.className = 'controles-cantidad';  // Disposicion horizontal
    
    // Boton para reducir cantidad
    const btnMenos = document.createElement('button');
    btnMenos.className = 'btn-cantidad';  // Estilo compartido para botones
    btnMenos.textContent = '-';  // Simbolo de resta
    
    // Elemento que muestra la cantidad actual
    const cantidad = document.createElement('span');
    cantidad.textContent = producto.cantidad;  // Muestra valor numerico desde el objeto
    
   // Boton para aumentar cantidad
const btnMas = document.createElement('button');
btnMas.className = 'btn-cantidad';  // Mismo estilo que boton "-"
btnMas.textContent = '+';  // Simbolo de suma

// Evento para boton "-" (restar cantidad)
btnMenos.addEventListener('click', () => {
    if (producto.cantidad > 1) {
        producto.cantidad--;  // Reduce cantidad en 1 unidad
        actualizarCarritoDOM();  // Vuelve a dibujar todo el carrito
    } else if (carrito.length > 1) {  // Si es el ultimo item de ESE producto
        carrito.splice(index, 1);  // Elimina producto del array
        actualizarCarritoDOM();
    }
});

// Evento para boton "+" (sumar cantidad)
btnMas.addEventListener('click', () => {
    producto.cantidad++;  // Aumenta cantidad en 1
    actualizarCarritoDOM();  // Actualiza interfaz
});

// Agrega controles al contenedor: [-] cantidad [+]
controles.appendChild(btnMenos);
controles.appendChild(cantidad);
controles.appendChild(btnMas);

// Ensambla secciones de info y controles en el item
item.appendChild(infoProducto);
item.appendChild(controles);

// Agrega item completo a la lista principal
listaProductos.appendChild(item);
});

// Inserta toda la lista de productos en el carrito visible
carritoMenu.appendChild(listaProductos);

// Calcula total general sumando (precio * cantidad) de todos los items
const total = carrito.reduce((sum, producto) => sum + (producto.precio * producto.cantidad), 0);

// Crea seccion de resumen (total + boton de compra)
const resumen = document.createElement('div');
resumen.className = 'resumen-carrito';  // Contenedor flex para alinear elementos

// Texto del total general
const textoTotal = document.createElement('p');
textoTotal.className = 'total-carrito';
textoTotal.textContent = `Total: $${total.toFixed(2)}`;  // Formato con 2 decimales

// Boton para finalizar compra
const btnComprar = document.createElement('button');
btnComprar.className = 'btn-comprar';
btnComprar.textContent = 'Finalizar Compra';  // Inicia proceso de checkout
  
 // Evento para el boton de finalizar compra
btnComprar.addEventListener('click', (e) => {
  e.preventDefault();  // Evita comportamiento por defecto de un <button>
  mostrarModalCompra();  // Llama a la funcion que muestra el modal de pago
});

// Agrega elementos de total y boton al resumen
resumen.appendChild(textoTotal);
resumen.appendChild(btnComprar);
carritoMenu.appendChild(resumen);  // Añade el resumen al carrito

guardarCarrito();  // Guarda el carrito actualizado en localStorage
}

// Función para configurar eventos de los botones "Añadir al carrito"
function actualizarBotonesCarrito() {
  document.querySelectorAll('.add-to-cart').forEach(async (button) => {
    button.addEventListener('click', async function() {
      const productCard = this.closest('.product-card');
      const productId = this.getAttribute('data-id');
      const productName = productCard.querySelector('h3').textContent;
      const productPrice = parseFloat(productCard.querySelector('.product-price').textContent.replace('$', ''));
      
      try {
        const response = await fetch(`http://localhost:3600/api/productos/${productId}`);
        const [producto] = await response.json();
        const stock = producto.entradas - producto.salidas;
        
        if (stock <= 0) {
          throw new Error('Este producto está agotado');
        }
        
        const productoExistente = carrito.find(item => item.id === productId);
        
        if (productoExistente && productoExistente.cantidad >= stock) {
          throw new Error('No hay suficiente stock disponible');
        }
        
        const mensaje = document.createElement('div');
        mensaje.className = 'mensaje-carrito';
        mensaje.textContent = `¡${productName} añadido al carrito!`;
        document.body.appendChild(mensaje);
        
        setTimeout(() => {
          mensaje.remove();
        }, 2000);
        
        if (productoExistente) {
          productoExistente.cantidad++;
        } else {
          carrito.push({
            id: productId,
            nombre: productName,
            precio: productPrice,
            cantidad: 1
          });
        }
        
        actualizarCarritoDOM();
        guardarCarrito();
        
      } catch (error) {
        alert(error.message);
      }
    });
  });
}

// =============================================
// FUNCIONES DEL MODAL DE COMPRA
// =============================================

function mostrarModalCompra() {
  const token = localStorage.getItem("token");
  
  if (!token) {
    // Guardar carrito actual como anónimo antes de redirigir
    const carritoActual = JSON.parse(localStorage.getItem('carrito')) || [];
    if (carritoActual.length > 0) {
      localStorage.setItem('carritoAnonimo', JSON.stringify(carritoActual));
    }
    
    alert("Debes iniciar sesión para finalizar la compra");
    window.location.href = "assets/pages/log-in.html";
    return;
  }

  const modal = document.getElementById("modal-compra");
  const resumenCompra = document.getElementById("resumen-compra");
  
  let htmlResumen = '<h3>Resumen de tu compra</h3>';
  const total = carrito.reduce((sum, producto) => sum + (producto.precio * producto.cantidad), 0);
  
  carrito.forEach(producto => {
    htmlResumen += `
      <p>${producto.nombre} - ${producto.cantidad} x $${producto.precio.toFixed(2)} = $${(producto.precio * producto.cantidad).toFixed(2)}</p>
    `;
  });
  
  htmlResumen += `<p><strong>Total: $${total.toFixed(2)}</strong></p>`;
  resumenCompra.innerHTML = htmlResumen;
  
  modal.style.display = "block";
}

// Funcion para cerrar el modal de compra
function cerrarModal() {
  const modal = document.getElementById("modal-compra");
  modal.style.display = "none";  // Oculta el modal cambiando el estilo
}

// Funcion principal para procesar la compra
async function finalizarCompra(event) {
    event.preventDefault();  // Evita el envio tradicional del formulario
    
    const token = localStorage.getItem("token");
    if (!token) {  // Verifica si el usuario esta autenticado
        alert("Sesión expirada. Por favor, inicia sesión nuevamente.");
        window.location.href = "assets/pages/log-in.html";
        return;
    }

    // Obtiene los valores del formulario
    const direccion = document.getElementById("direccion").value;
    const metodoPago = document.getElementById("metodo-pago").value;
    const total = carrito.reduce((sum, producto) => sum + (producto.precio * producto.cantidad), 0);  // Calcula total
    
    try {
        const btnConfirmar = document.querySelector('.btn-confirmar');
        btnConfirmar.disabled = true;  // Desactiva el boton para evitar doble clic
        btnConfirmar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';  // Muestra spinner de carga

        
        // Validacion de stock para todos los productos del carrito
        const stockPromises = carrito.map(async producto => {
            const response = await fetch(`http://localhost:3600/api/productos/${producto.id}`);
            if (!response.ok) throw new Error("Error al verificar stock");
            const data = await response.json();
            
            // Calcula stock disponible (entradas - salidas)
            const stock = data[0].entradas - data[0].salidas;
            
            if (stock <= 0) {  // Producto agotado
                throw new Error(`El producto ${producto.nombre} está agotado`);
            }
            if (producto.cantidad > stock) {  // Cantidad mayor al stock
                throw new Error(`No hay suficiente stock para ${producto.nombre}. Disponible: ${stock}`);
            }
            
            return { ...producto, stock };  // Devuelve producto con info de stock
        });

        await Promise.all(stockPromises);  // Espera todas las validaciones

        // Obtiene datos del usuario desde el backend
        const userData = await obtenerDatosUsuario(token);
        
        // Envia datos de la venta al servidor
        const ventaResponse = await fetch("http://localhost:3600/api/ventas", {
            method: "POST",
            headers: {  // Cabeceras de autenticacion y tipo de contenido
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({  // Datos de la venta en formato JSON
                direccion,
                metodo_pago: metodoPago,
                total,
                productos: carrito  // Lista completa del carrito
            })
        });
        
        const resultado = await ventaResponse.json();
        
        if (!ventaResponse.ok) {  // Maneja errores del servidor
            throw new Error(resultado.message || "Error al procesar la compra");
        }

        alert(`¡Compra realizada con éxito!`);  // Mensaje de exito
        carrito = [];  // Vacía el carrito
        guardarCarrito();  // Guarda el carrito actualizado en localStorage
        actualizarCarritoDOM();  // Actualiza la interfaz
        cerrarModal();  // Cierra el modal de compra
        
    } catch (error) {
        console.error("Error en finalizarCompra:", error);  // Log para debug
        alert(`Error: ${error.message}`);  // Muestra error al usuario
        
        // Actualizacion opcional del stock en la interfaz
        if (error.message.includes("agotado") || error.message.includes("suficiente stock")) {
            // logica para actualizar el carrito aqui
        }
    } finally {  // Se ejecuta siempre
        const btnConfirmar = document.querySelector('.btn-confirmar');
        if (btnConfirmar) {
            btnConfirmar.disabled = false;  // Reactiva el boton
            btnConfirmar.textContent = 'Confirmar Compra';  // Restaura texto original
        }
    }
}

// Funcion para verificar si un token JWT es valido
async function verificarToken(token) {
    try {
      // Hacer peticion al endpoint de usuario con el token
      const response = await fetch("http://localhost:3600/api/user", {
        headers: { Authorization: `Bearer ${token}` }  // Envia token en cabecera
      });
      return response.ok;  // Devuelve true si la respuesta es 200-299
    } catch (error) {
      return false;  // Si hay error de conexion, retorna false
    }
  }

  // Funcion para obtener datos del usuario autenticado
  async function obtenerDatosUsuario(token) {
    // Realiza misma peticion que verificarToken pero para obtener datos
    const response = await fetch("http://localhost:3600/api/user", {
      headers: { Authorization: `Bearer ${token}` }  // Autenticacion tipo Bearer
    });
    
    if (!response.ok) {  // Si el servidor devuelve error
      throw new Error("Error al obtener datos del usuario. Status: " + response.status);  // Mensaje detallado
    }
    
    return await response.json();  // Parsea y devuelve los datos del usuario
  }

  
  

// =============================================
// FUNCIONES DE PRODUCTOS
// =============================================

// Funcion para cargar productos destacados desde el backend
async function cargarProductosDestacados() {
  try {
    // Hacer peticion al endpoint de productos destacados
    const response = await fetch("http://localhost:3600/api/productos/destacados");

    if (!response.ok) {  // Si la respuesta falla (404, 500, etc)
      throw new Error("Error al cargar los productos destacados");  // Mensaje generico
    }

    const productos = await response.json();  // Parsea la respuesta a JSON
    const contenedor = document.getElementById("productos-destacados");
    contenedor.innerHTML = "";  // Limpia el contenedor de productos anteriores

    // Contruye cada tarjeta de producto
    productos.forEach((producto) => {
      const stock = producto.entradas - producto.salidas;  // Calcula stock disponible
      const imagenURL = `http://localhost:3600${producto.imagen_url}`;  // Ruta completa de imagen

      // Template string con HTML dinamico
      const tarjetaHTML = `
        <div class="product-card">
          <div class="product-image">
            <img src="${imagenURL}" alt="${producto.nombre}" onerror="this.src='img/no-image.png'">   <!-- Si falla imagen, usa placeholder -->
          </div>
          <div class="product-info">
            <h3>${producto.nombre}</h3>  <!-- Nombre del producto -->
            <p class="product-price">$${parseFloat(producto.precio).toFixed(2)}</p>  <!-- Precio con 2 decimales -->
            <p class="product-stock">${stock > 0 ? `Disponible: ${stock}` : 'AGOTADO'}</p>  <!-- Muestra stock o agotado -->
            <p class="product-description">${producto.descripcion || ""}</p>  <!-- Descripcion opcional -->
            <p class="product-brand">Marca: ${producto.marca || "No especificada"}</p>  <!-- Marca con valor por defecto -->
            <button class="add-to-cart" data-id="${producto.id}" ${stock <= 0 ? 'disabled' : ''}>
              ${stock <= 0 ? 'Agotado' : 'Añadir al Carrito'}  <!-- Boton dinamico segun stock -->
            </button>
          </div>
        </div>
      `;

      contenedor.innerHTML += tarjetaHTML;  // Agrega la tarjeta al DOM
    });

    actualizarBotonesCarrito();  // Configura los eventos de los botones

  } catch (error) {
    console.error("Error al cargar productos:", error);  // Log para debug
    const contenedor = document.getElementById("productos-destacados");
    contenedor.innerHTML = "<p>No se pudieron cargar los productos destacados</p>";  // Mensaje de error simple
  }
}

// =============================================
// FUNCIONES DEL MENÚ
// =============================================

// Funcion para alternar la visibilidad del menú móvil 🍔
function toggleMenu() {
  const navContainer = document.querySelector(".nav-container"); // Contenedor del menú
  const hamburger = document.querySelector(".hamburger"); // Icono de hamburguesa

  navContainer.classList.toggle("active"); // Agrega/remueve clase active al menú
  hamburger.classList.toggle("active"); // Anima el icono hamburguesa a X
}

// Configura el comportamiento del menú en dispositivos mobiles 📱
function configurarMenuMobile() {
  const isMobile = window.innerWidth <= 768; // Detecta si es móvil por el ancho

  if (isMobile) {
    const dropdowns = document.querySelectorAll(".dropdown"); // Todos los submenus

    dropdowns.forEach((dropdown) => {
      const link = dropdown.querySelector("a"); // Enlace principal del dropdown

      // Evento click para móviles
      link.addEventListener("click", function(e) {
        e.preventDefault(); // Evita la navegación del enlace
        dropdown.classList.toggle("active"); // Abre/cierra el submenú

        // Cierra otros submenus abiertos
        dropdowns.forEach((otherDropdown) => {
          if (otherDropdown !== dropdown && otherDropdown.classList.contains("active")) {
            otherDropdown.classList.remove("active"); // Remueve clase active de otros
          }
        });
      });
    });
  }
}

// =============================================
// FUNCIONES DE ANIMACIONES
// =============================================

// Funcion para verificar scroll y activar animaciones al hacer scroll 📜
function checkScroll() {
  // Seleciona todos los elementos que tendran animaciones
  const elements = document.querySelectorAll(".product-card, .section-title, .about-content");

  // Recorre cada elemento animable
  elements.forEach((element) => {
    // Obtiene la posicion del elemento en el viewport
    const position = element.getBoundingClientRect();

    // Verifica si el elemento esta dentro del area visible
    if (position.top < window.innerHeight && position.bottom >= 0) {
      element.classList.add("animate");  // Agrega clase para trigger de animacion
    }
  });
}

// =============================================
// INICIALIZACIÓN
// =============================================

// Inicialisacion al cargar la paguina
document.addEventListener("DOMContentLoaded", () => {
  cargarProductosDestacados();       // Carga productos destacados del backend
  actualizarCarritoDOM();            // Renderisa carrito inicial
  configurarMenuMobile();            // Aplica logica de menu para moviles
  checkScroll();                     // Chekea scroll al cargar para animaciones
  
  // Evento para animar elementos al hacer scroll
  window.addEventListener("scroll", checkScroll);
  
  // Listaners para el modal de compra
  document.querySelector(".cerrar-modal").addEventListener("click", cerrarModal);  // Boton cerrar
  document.getElementById("formulario-compra").addEventListener("submit", finalizarCompra);  // Envio de formulario
});