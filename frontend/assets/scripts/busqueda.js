// Espera a que la paguina cargue completamente
document.addEventListener('DOMContentLoaded', () => {
    // Selecciona el input de busqueda y crea contenedor para sugerencias
    const searchInput = document.querySelector('.search-input');
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'search-suggestions';
    // Inserta el contenedor despues del input en el DOM
    searchInput.parentNode.insertBefore(suggestionsContainer, searchInput.nextSibling);

    let timeoutId;  // Para el debounce de busqueda

    // Funcion que muestra las sugerencias al usuario
    const mostrarSugerencias = (productos) => {
        suggestionsContainer.innerHTML = '';  // Limpia sugerencias anteriores

        if (productos.length === 0) {
            // Muestra mensaje si no hay resultados
            suggestionsContainer.innerHTML = '<div class="suggestion-item">No se encontraron resultados</div>';
            return;
        }

        // Crea un elemento por cada producto encontrado
        productos.forEach(producto => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerHTML = `
    <div class="suggestion-text">
        <h4>${producto.nombre}</h4>
        <p>$${parseFloat(producto.precio).toFixed(2)}</p>
    </div>
`;

            // Evento click para redirigir al catalogo
            div.addEventListener('click', () => {
                const categoria = producto.categoria.toLowerCase().replace(/\s+/g, '-');  // Formatea categoria para URL

            // Redirige a la paguina de catalogo especifica
            window.location.href = `assets/pages/catalogo-${categoria}.html`;
            
            // Limpia la busqueda despues de seleccionar
            searchInput.value = '';
            suggestionsContainer.innerHTML = '';
});
            
            suggestionsContainer.appendChild(div);  // Agrega al contenedor
        });
    };

    // Evento que detecta cuando el usuario escribe
    searchInput.addEventListener('input', function(e) {
        clearTimeout(timeoutId);  // Cancela el timeout anterior
        const termino = e.target.value.trim();  // Obtiene termino limpio

        if (!termino) {
            suggestionsContainer.innerHTML = '';  // Si esta vacio, no muestra nada
            return;
        }

        // Debounce: espera 300ms antes de hacer la peticion
        timeoutId = setTimeout(async () => {
            try {
                // Pide datos al backend
                const response = await fetch(`http://localhost:3600/api/productos/buscar?termino=${encodeURIComponent(termino)}`);
                const productos = await response.json();
                mostrarSugerencias(productos);  // Muestra resultados
            } catch (error) {
                console.error('Error:', error);  // Debug
                suggestionsContainer.innerHTML = '<div class="suggestion-error">Error al cargar resultados</div>';
            }
        }, 300);
    });

    // Cierra las sugerencias si hace click fuera del area
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target)) {
            suggestionsContainer.innerHTML = '';  // Limpia el contenedor
        }
    });
});