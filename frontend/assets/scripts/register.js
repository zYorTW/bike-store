//Ruta hacia el servidor
const url = 'http://localhost:3600/api/register'; //El puerto puede variar dependiendo el computador
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//Todo esto se ejecutara siempre y cuando la pagina este cargada
document.addEventListener('DOMContentLoaded', function () {

    const formulario = document.querySelector('.sig-up-form');
    const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/; 

    if (!formulario) {
        console.error('No se encontró el formulario en la página');
        return;
    }

    formulario.addEventListener('submit', function (event) {

        //Hace que la pagina no se recargue una vez se le de al boton submit
        event.preventDefault();

        // Capturar valores del formulario
        const nombre = document.getElementById('user_name').value.trim();
        const apellido = document.getElementById('user_lastname').value.trim();
        const cedula = document.getElementById('user_identityDoc').value.trim();
        const telefono = document.getElementById('user_tel').value.trim();
        const correo = document.getElementById('user_email').value.trim();
        const contraseña = document.getElementById('user_password').value.trim();
        const passwordConfirm = document.getElementById('user_passwordConfirm').value.trim(); //Se  crea una constante para confirmar contraseña, pero, no se efectua en la base de datos
        const rol = "cliente"

        if (!emailRegex.test(correo)) {
            alert('Por favor, ingresa un correo electrónico válido (ej: usuario@dominio.com)');
        }

       //Esto verifica que en el campo cedula solo sean datos numericos
        if (isNaN(cedula)) { 
            alert('El campo Cedula solo debe contener números');
            return;
        }
        
        if (isNaN(telefono)) {
            alert('El campo Teléfono solo debe contener números');
            return;
        }
        
        if (!soloLetras.test(nombre) ) {  
            alert('El campo Nombre solo debe contener letras.');
            return;
        }

        if (!soloLetras.test(apellido) ) {  
            alert('El campo Apellido solo debe contener letras.');
            return;
        }


        //Esto hace que el usuario solo pueda escribir un numero de telefono de 10 digitos
        if(telefono.length !== 10 ){
            alert('El campo telefono debe tener 10 digitos');
            return;
        }

        //Esto hace que el usuario solo pueda escribir un numero de cedula entre 8 y 10 digitos
        if(cedula.length < 8 || cedula.length > 10){
            alert('El campo cedula debe tener entre 8 y 10 digitos');
            return;
        }
        // Se pone un condicional para poner un minimo de 8 digitos alfanumericos
        if (contraseña.length < 8) {
            alert('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        //Se verifica que la contraseña sea igual en los dos campos del registro
        if (contraseña !== passwordConfirm) {
            alert('Las contraseñas no coinciden');
            return;
        }

        // Crear objeto con datos del cliente
        const clienteData = {
            nombre,
            apellido,
            cedula,
            telefono,
            correo,
            rol,
            contraseña
        };

        //Enviar el objeto a la función que realizará la petición al Endpoint realizar la inserción en la BD
        registrarCliente(clienteData);
    });
});



//Esta funcion crea una peticion para enviar los datos al servidor
function registrarCliente(clienteData) {
    console.log('Datos que se enviarán:', clienteData);
    console.log('Enviando datos...');

    //Esto envua los datos en formato json al Endpoint del Backend
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(clienteData)
    })

    //Si se registra correctamente el cliente dira un mensaje que se ingresó, en cambio, si es al revés, dara una una alerta con el error
    .then(response => response.json()) // Primero parseamos la respuesta a JSON
.then(data => {
    if (data.message === "Usuario registrado exitosamente") {
        alert('Te has registrado con éxito');
        window.location.href = 'log-in.html';
    } else {
        alert(data.message || 'Hubo un error al registrarse');
    }
})
        .catch(error => {
           alert('Hubo un error al registrarsre, intentelo de nuevo: ', error.message);
        });
}
// Esto es el icono que muestra la contreña en caso de que quiera verla, icono que esta al lado e
function togglePassword() {
    const passwordInput = document.getElementById('user_password');
    const icon = document.querySelector('.toggle-password');

    //Cambia el tipo entre text y password
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';

        //Cambia el icono entre cerrar y abrir el ojo
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

//Esto hace que las funciones funcionen globalmente y no solo en el js
window.togglePassword = togglePassword;