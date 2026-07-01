document.getElementById('recoveryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;

    try {
        // Solicitar el enlace de restablecimiento (el servidor lo envía por correo si existe la cuenta)
        const response = await fetch('http://localhost:3600/api/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo: email })
        });

        const data = await response.json();

        // Respuesta genérica siempre: no revela si el correo existe o no
        alert(data.message || 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña');
    } catch (error) {
        alert('Error al conectar con el servidor');
    }
});
