// Escapa texto antes de insertarlo como HTML, para evitar XSS con datos que vienen del servidor
function escapeHTML(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

// Espera a que el documento HTML termine de cargarse
document.addEventListener('DOMContentLoaded', function() {
    cargarProductosRepuestos(); // Inicia la carga de productos
});

// Funcion para obtener y mostrar repuestos desde la API
async function cargarProductosRepuestos() {
    try {
        // Realiza peticion al endpoint de repuestos
        const response = await fetch('http://localhost:3600/api/productos/repuestos');
        const productos = await response.json(); // Convierte respuesta a JSON
        
        const productGrid = document.querySelector('.product-grid'); // Contenedor de productos
        productGrid.innerHTML = ''; // Limpia contenido previo

        // Construye las tarjetas de producto dinamicamente
        productos.forEach(producto => {
            productGrid.innerHTML += `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${producto.imagen_url || '../assets/img/placeholder.jpg'}" alt="${escapeHTML(producto.nombre)}"> <!-- Usa imagen por defecto si no hay URL -->
                    </div>
                    <div class="product-info">
                        <h3>${escapeHTML(producto.nombre)}</h3>
                        <p class="product-description">${escapeHTML(producto.descripcion)}</p>
                        <div class="product-meta">
                            <p class="product-price">$${producto.precio.toLocaleString('es-CO')}</p> <!-- Formatea numero con separadores -->
                            ${producto.destacado ? '<span class="destacado">¡Destacado!</span>' : ''} <!-- Muestra etiqueta condicional -->
                        </div>
                        <button class="add-to-cart">Añadir al Carrito</button> <!-- Boton sin funcionalidad implementada -->
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error('Error cargando bicicletas:', error); // Mensaje incorrecto (deberia decir 'repuestos')
        productGrid.innerHTML = '<p class="error">Error al cargar los repuestos</p>'; // Muestra error al usuario
    }
}