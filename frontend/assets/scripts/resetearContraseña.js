// Escucha el evento de envío del formulario con el ID resetForm
document.getElementById('resetForm').addEventListener('submit', async (e) => {
    // Evita que el formulario se envíe de forma predeterminada (recarga de la página).
    e.preventDefault();

    // Obtiene el valor de la nueva contraseña ingresada por el usuario
    const nuevaContraseña = document.getElementById('nuevaContraseña').value;

    // Obtiene el valor de la confirmación de la contraseña ingresada
    const confirmarContraseña = document.getElementById('confirmarContraseña').value;

    // Obtiene el parámetro 'email' desde la URL (ejemplo: ?email=usuario@ejemplo.com).
    const email = new URLSearchParams(window.location.search).get('email');

    // Verifica si las contraseñas ingresadas no coinciden
    if (nuevaContraseña !== confirmarContraseña) {
        alert('Las contraseñas no coinciden'); // Muestra un mensaje de alerta.
        return; // Detiene la ejecución del resto del código
    }

    // Verifica si la nueva contraseña tiene menos de 8 caracteres
    if (nuevaContraseña.length < 8) {
        alert('La contraseña debe tener al menos 8 caracteres'); // Muestra un mensaje de alerta.
        return; // Detiene la ejecución del resto del código
    }

    try {
        // Realiza una solicitud POST al servidor para restablecer la contraseña.
        const response = await fetch('http://localhost:3600/api/reset-password', {
            method: 'POST', // Especifica el método HTTP.
            headers: { 'Content-Type': 'application/json' }, // Establece los encabezados.
            body: JSON.stringify({ email, nuevaContraseña }) // Envía los datos en formato JSON.
        });

        // Convierte la respuesta del servidor a un objeto JSON
        const data = await response.json();

        // Muestra el mensaje que se recibió en la respuesta del servidor
        alert(data.message);

        // Si la respuesta es exitosa, redirige al usuario a la página de inicio de sesión.
        if (response.ok) window.location.href = 'log-in.html';
    } catch (error) {
        // Si ocurre un error durante la solicitud, muestra un mensaje de error.
        alert('Error al restablecer la contraseña');
    }
});
