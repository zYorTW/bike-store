// Cuando la paguina termina de cargarse, llama a la funcion de biciceltas
document.addEventListener('DOMContentLoaded', function() {
    cargarProductosBicicletas();  // Inicia la carga de productos
});

// Funcion asincrona para obtener las bicicletas del backend
async function cargarProductosBicicletas() {
    try {
        // Pide datos al servidor (endpoint de bicicletas)
        const response = await fetch('http://localhost:3600/api/productos/bicicletas');
        const productos = await response.json();  // Convierte la respuesta en JSON
        
        const productGrid = document.querySelector('.product-grid');  // Contenedor donde van las tarjetas
        productGrid.innerHTML = '';  // Limpia el contenido anterior (por si hay basura)

        // Por cada producto, crea una tarjeta y la añade
        productos.forEach(producto => {
            productGrid.innerHTML += `
                <div class="product-card">
                    <div class="product-image">
                      <img src="${producto.imagen_url || '../assets/img/placeholder.jpg'}"> alt="${producto.nombre}">  <!-- imagen por defecto si no hay URL -->
                    </div>
                    <div class="product-info">
                        <h3>${producto.nombre}</h3>
                        <p class="product-description">${producto.descripcion}</p>
                        <div class="product-meta">
                            <p class="product-price">$${producto.precio.toLocaleString()}</p>  <!-- Precio con puntos para miles -->
                            ${producto.destacado ? '<span class="destacado">¡Destacado!</span>' : ''}  <!-- Etiqueta opcional -->
                        </div>
                        <button class="add-to-cart">Añadir al Carrito</button> 
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error('Error cargando bicicletas:', error);  // debug 
        productGrid.innerHTML = '<p class="error">Error al cargar las bicicletas</p>';  // Mensaje de error visible
    }
}