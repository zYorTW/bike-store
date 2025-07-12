const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

document.querySelector(".login-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  // Guardar carrito actual como anónimo antes de cualquier redirección
  const carritoActual = JSON.parse(localStorage.getItem('carrito')) || [];
  if (carritoActual.length > 0) {
    localStorage.setItem('carritoAnonimo', JSON.stringify(carritoActual));
  }

  const correo = document.getElementById("user_login").value.trim();
  const contraseña = document.getElementById("user_password").value.trim();

  if (!emailRegex.test(correo)) {
    alert('Por favor, ingresa un correo electrónico válido (ej: usuario@dominio.com)');
    return;
  }

  try {
      const respuesta = await fetch("http://localhost:3600/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo, contraseña }),
      });

      if (!respuesta.ok) {
          const errorData = await respuesta.json();
          throw new Error(errorData.message || `Error HTTP: ${respuesta.status}`);
      }

      const data = await respuesta.json();

      // Administrador
      if (respuesta.status === 201) {
          alert(data.message);
          window.location.href = "../pages/index-admin.html";
          return;
      }

      // Cliente
      if (respuesta.status === 200) {
          localStorage.setItem("token", data.token);
          
          try {
              const userResponse = await fetch("http://localhost:3600/api/user", {
                  headers: { Authorization: `Bearer ${data.token}` }
              });

              if (!userResponse.ok) {
                  throw new Error("Error al obtener datos del usuario");
              }

              const userData = await userResponse.json();
              alert(`¡Bienvenido ${userData.nombre}!`);
              window.location.href = "../../index.html";
          } catch (userError) {
              console.error("Error obteniendo datos usuario:", userError);
              throw new Error("Error al cargar información del usuario");
          }
          return;
      }

      throw new Error("Respuesta inesperada del servidor");

  } catch (error) {
      console.error("Error en login:", error);
      alert(`Error al iniciar sesión: ${error.message}`);
  }
});

function togglePassword() {
  const passwordInput = document.getElementById("user_password");
  const icon = document.querySelector(".toggle-password");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}