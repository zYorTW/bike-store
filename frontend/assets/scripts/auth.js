// Verifica cuando la página está lista (cargó el DOM)
document.addEventListener("DOMContentLoaded", async () => {
    // Obtiene el token guardado en el navegador del usuario
    const token = localStorage.getItem("token");
    // Elemento HTML donde se mostrará el nombre del usuario
    const userGreeting = document.getElementById("user-greeting");

    // Verificar y combinar carritos si es necesario
    const carritoAnonimo = JSON.parse(localStorage.getItem('carritoAnonimo')) || [];
    if (carritoAnonimo.length > 0 && token) {
        // Si hay carrito anónimo y el usuario está logueado
        const carritoActual = JSON.parse(localStorage.getItem('carrito')) || [];
        
        // Combinar carritos evitando duplicados y manteniendo las cantidades mayores
        const carritoCombinado = [...carritoAnonimo, ...carritoActual].reduce((acumulador, actual) => {
            const existe = acumulador.find(item => item.id === actual.id);
            if (!existe) {
                acumulador.push(actual);
            } else {
                existe.cantidad = Math.max(existe.cantidad, actual.cantidad);
            }
            return acumulador;
        }, []);
        
        localStorage.setItem('carrito', JSON.stringify(carritoCombinado));
        localStorage.removeItem('carritoAnonimo');
        
        // Mostrar mensaje al usuario
        alert('Los productos de tu carrito temporal se han añadido a tu cuenta');
    }

    // Método para cerrar sesión
    const logout = () => {
        // Guardar el carrito actual como anónimo antes de cerrar sesión
        const carritoActual = JSON.parse(localStorage.getItem('carrito')) || [];
        if (carritoActual.length > 0) {
            localStorage.setItem('carritoAnonimo', JSON.stringify(carritoActual));
        }
        
        localStorage.removeItem("token");  // elimina el token del almacenamiento
        window.location.href = "/index.html";  // redirige a página principal
    };

    // Solo si existe un token guardado
    if (token) {
        try {
            // Hace petición al backend para verificar usuario
            const response = await fetch("http://localhost:3600/api/user", {
                headers: { Authorization: `Bearer ${token}` }  // envía token en cabecera
            });

            // Si la respuesta no es OK (ej: token inválido)
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            // Convierte respuesta a JSON (datos del usuario)
            const userData = await response.json();
            
            // Si el rol es Cliente, actualiza la interfaz
            if (userData.rol === "Cliente") {
                // Inserta HTML con nombre y botón de logout
                userGreeting.innerHTML = `
                    <li class="usuario-info">
                        <a href="#" id="logout-btn" class="logout-btn">
                            <i class="fas fa-sign-out-alt"></i>${userData.nombre}, Cerrar Sesión
                        </a>
                    </li>
                `;

                // Agrega escuchador de clicks al botón de logout
                document.getElementById("logout-btn").addEventListener("click", (e) => {
                    e.preventDefault();  // evita que el link recargue la página
                    // Muestra confirmación antes de cerrar sesión
                    if (confirm("¿Deseas cerrar sesión?")) {
                        logout();  // llama al método de logout
                    }
                });
            }
        } catch (error) {
            // Si hay error (ej: token expirado), muestra en consola y cierra sesión
            console.error("Error verificando sesión:", error);
            logout();  // limpia el token inválido
        }
    }
});