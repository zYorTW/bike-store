// Función principal al cargar el documento
document.addEventListener('DOMContentLoaded', function () {
    // Cargar productos por categoría
    cargarProductosPorCategoria('bicicletas', 'Bicicletas'); 
    cargarProductosPorCategoria('accesorios', 'Accesorios');
    cargarProductosPorCategoria('repuestos', 'Repuestos');

// Función para cargar productos desde el backend
async function cargarProductosPorCategoria(contenedorId, categoria) {
    try {
        const response = await fetch(`http://localhost:3600/api/productos/${categoria}`);
        const productos = await response.json();
        
        const contenedor = document.getElementById(`${contenedorId}-container`);
        contenedor.innerHTML = '';

        productos.forEach(producto => {
            contenedor.innerHTML += `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${producto.imagen_url || '/assets/img/placeholder.jpg'}" alt="${producto.nombre}">
                    </div>
                    <div class="product-info">
                        <h3>${producto.nombre}</h3>
                        <p class="product-description">${producto.descripcion}</p>
                        <div class="product-meta">
                            <p class="product-price">$${producto.precio.toLocaleString()}</p>
                        </div>
                        <button class="add-to-cart">Añadir al Carrito</button>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error(`Error cargando ${categoria}:`, error);
        document.getElementById(`${contenedorId}-container`).innerHTML = 
            '<p class="error">Error al cargar los productos.</p>';
    }
}
});

// Toggle del menú de navegación en dispositivos móviles
function toggleMenu() {
    const navContainer = document.querySelector('.nav-container');
    const hamburger = document.querySelector('.hamburger');
    
    navContainer.classList.toggle('active');
    hamburger.classList.toggle('active');
}

// Función principal al cargar el documento
document.addEventListener('DOMContentLoaded', function () {

// Menús desplegables móviles
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('a');
            link.addEventListener('click', function(e) {
                e.preventDefault();
                dropdown.classList.toggle('active');
                dropdowns.forEach(other => {
                    if (other !== dropdown && other.classList.contains('active')) {
                        other.classList.remove('active');
                    }
                });
            });
        });
    }

    // Animación al hacer scroll
    function checkScroll() {
        const elements = document.querySelectorAll('.product-card, .section-title, .about-content');
        elements.forEach(element => {
            const position = element.getBoundingClientRect();
            if (position.top < window.innerHeight && position.bottom >= 0) {
                element.classList.add('animate');
            }
        });
    }

    window.addEventListener('scroll', checkScroll);
    checkScroll();

    // Botón de búsqueda
    document.querySelector('.search-button')?.addEventListener('click', function() {
        const searchQuery = document.querySelector('.search-input').value;
        if (searchQuery.trim() !== '') {
            console.log('Buscando:', searchQuery);
            // Implementar lógica de búsqueda aquí
        }
    });
});