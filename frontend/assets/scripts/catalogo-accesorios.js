// Espera a que la paguina cargue completamente 
document.addEventListener('DOMContentLoaded', function() {
    cargarProductosAccesorios();  // Llama a la funcion principal al iniciar
});

// Funcion asincrona para traer productos de accesorios desde el backend
async function cargarProductosAccesorios() {
    try {
        // Hace peticion al endpoint de accesorios
        const response = await fetch('http://localhost:3600/api/productos/accesorios');
        const productos = await response.json();  // Convierte respuesta a JSON
        
        const productGrid = document.querySelector('.product-grid');  // Contenedor de productos
        productGrid.innerHTML = '';  // Limpia contenido anterior (por si hay algo)

        // Itera cada producto y crea tarjetas
        productos.forEach(producto => {
            // Genera HTML dinamico con los datos
            productGrid.innerHTML += `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${producto.imagen_url || '../assets/img/placeholder.jpg'}"  alt="${producto.nombre}">  <!-- Usa imagen placeholder si no hay URL -->
                    </div>
                    <div class="product-info">
                        <h3>${producto.nombre}</h3>
                        <p class="product-description">${producto.descripcion}</p>
                        <div class="product-meta">
                            <p class="product-price">$${producto.precio.toLocaleString()}</p>  <!-- Formatea precio con separadores -->
                            ${producto.destacado ? '<span class="destacado">¡Destacado!</span>' : ''}  <!-- Muestra etiqueta si esta destacado -->
                        </div>
                        <button class="add-to-cart">Añadir al Carrito</button>  
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error('Error cargando bicicletas:', error);  // oops, dice bicicletas pero es para accesorios (debug)
        productGrid.innerHTML = '<p class="error">Error al cargar los accesorios</p>';  // Mensaje amigable para el usuario
    }
}
