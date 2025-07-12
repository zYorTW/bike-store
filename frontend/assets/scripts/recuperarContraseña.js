document.getElementById('recoveryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;

    try {
        // Verificar si el email existe
        const response = await fetch('http://localhost:3600/api/check-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            // Redirigir a la página de nueva contraseña
            window.location.href = `resetearContraseña.html?email=${encodeURIComponent(email)}`;
        } else {
            alert(data.error || 'El correo no está registrado');
        }
    } catch (error) {
        alert('Error al conectar con el servidor');
    }
});