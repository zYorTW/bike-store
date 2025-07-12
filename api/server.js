const express = require("express");
const multer = require("multer");
const path = require("path");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { promisify } = require("util"); // Añade esto

//diskStorage configura dode se guardan los archivos
const storage = multer.diskStorage({
  //destination define donde se almacenan los archivos, en este caso en la carpeta "Uploads"
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },

  //filename Cambia el nombre del archivo usando la fecha actual (Date.now), y la extension original(jpg, png, etc)
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,

  //Se define el tamaño del archivo(5MB)
  limits: { fileSize: 5 * 1024 * 1024 },

  //Contiene el tipo de archivo()
  fileFilter: (req, file, cb) => {
    //Se crea arrays con los tipos permitidos
    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
    //Si el archivo es valido se dejara subir, si no dejara error
    if (tiposPermitidos.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes (JPEG/PNG/WEBP)"));
    }
  },
});
//llamado de las dependencias
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const llaveSecreta = "JDY"; //Clave segura de del jsonwebtoken

//Definimos la conexión a la base de datos
const conexion = mysql.createConnection({
  host: "localhost", //localhost puede variar dependiendo del computador
  user: "root",
  password: "root",
  database: "bikeStore",
});

conexion.query = promisify(conexion.query);

// Funciones
// =============================================================================================

//funcion para la conexión y la reconexión
function conectarBD() {
  conexion.connect((error) => {
    if (error) {
      //En caso de existir un error en la conexión
      console.log("[db error]", error); //Mostrar el error por la consola
      setTimeout(conectarBD, 200); //Esta linea pone un lapso de espera de 200 ms y vuelve a intenar la conexión
    } else {
      console.log("¡Conexión exitosa a la base de datos!"); //En caso de que lla conexión sea exitosa mostrará un mensaje.
    }
  });

  // Manejo de errores:
  conexion.on("error", (error) => {
    //Cuando la conexión este establecida y esta se pierda debido a algún error.
    if (error.code === "PROTOCOL_CONNECTION_LOST") {
      conectarBD(); //Se realiza un llamado a la función para restablecer la conexión automaticamente.
    } else {
      throw error; //Si no se logra restablecer la conexión por algún motivo, se detendrá la ejecución.
    }
  });
}

conectarBD();

/////CRUD COMPLETO/////

//Función para obtener todos los registros de una tabla especifica de una base de datos:
function obtenerTodos(tabla) {
  return new Promise((resolve, reject) => {
    conexion.query(`SELECT * FROM ${tabla}`, (error, resultados) => {
      if (error) {
        reject(error);
      } else {
        resolve(resultados);
      }
    });
  });
}

//Función para obtener un registro de una tabla especifica por su id, en una base de datos:
function obtenerUno(tabla, id) {
  return new Promise((resolve, reject) => {
    conexion.query(
      `SELECT * FROM ${tabla} WHERE id = ?`,
      [id],
      (error, resultado) => {
        if (error) {
          reject(error);
        } else {
          resolve(resultado);
        }
      }
    );
  });
}

//Función para crear un registro de una tabla por su id
function crear(tabla, data) {
  return new Promise((resolve, reject) => {
    conexion.query(`INSERT INTO ${tabla} SET ? `, data, (error, resultado) => {
      if (error) {
        reject(error);
      } else {
        Object.assign(data, { id: resultado.insertId });
        resolve(data);
      }
    });
  });
}

//Función para actualizar un registro de una tabla especifica por su id
function actualizar(tabla, id, data) {
  return new Promise((resolve, reject) => {
    conexion.query(
      `UPDATE ${tabla} SET ? WHERE id = ?`,
      [data, id],
      (error, resultado) => {
        if (error) {
          reject(error);
        } else {
          resolve(resultado);
        }
      }
    );
  });
}

//Función para eliminar un registro de una tabla especifica por su id
function eliminar(tabla, id) {
  return new Promise((resolve, reject) => {
    conexion.query(
      `DELETE FROM ${tabla} WHERE id = ?`,
      [id],
      (error, resultado) => {
        if (error) {
          reject(error);
        } else {
          resolve(resultado);
        }
      }
    );
  });
}

//Funcion para obtener un un registro de una especifica por su atributo categoria
const obtenerProductosPorCategoria = async (categoria) => {
  try {
    const [productos] = await conexion
      .promise()
      .query("SELECT * FROM productos WHERE categoria = ?", [categoria]);

    productos.forEach((producto) => {
      producto.imagen_url = producto.imagen
        ? `/uploads/${producto.imagen}`
        : null;

      producto.precio = parseFloat(producto.precio);
    });

    return productos;
  } catch (error) {
    throw new Error(error.message);
  }
};

// =============================================================================================

//RUTAS_ENDPOINTS------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//Las rutas en Express definen como el servidor web responde a las solicitudes HTTP en diferentes URL.
//Ruta de inicio:
app.get("/", (req, res) => {
  res.send("Ruta INICIO");
});
//Cuando el usuario accede a  http://localhost:3000/, "El servidor responde con el mensaje: 'Ruta INICIO'."

// Endpoints de las Ventas
// =============================================================================================

// endpoint para obtener ventas filtradas por un rango de fechas
app.get("/api/ventafiltradas", async (req, res) => {
  // se extraen las fechas de la query
  const { fechaInicio, fechaFin } = req.query;

  // validamos que la fecha de inicio no sea mayor a la fecha final
  if (new Date(fechaInicio) > new Date(fechaFin)) {
    return res.status(400).json({
      error: "La fecha inicial no puede ser posterior a la final",
    });
  }

  // se verifica que ambas fechas existan
  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({ error: "¡Faltan las fechas!" });
  }

  try {
    // se ejecuta la consulta para obtener la info de las ventas
    const results = await conexion.query(
      `
    SELECT 
        v.fecha, 
        u.nombre AS cliente, 
        p.nombre AS producto, 
        v.dirección, 
        v.metodo_pago,
        dv.cantidad,
        v.total
    FROM ventas v
    JOIN detalle_ventas dv ON v.id = dv.id_venta
    JOIN productos p ON dv.id_producto = p.id
    JOIN usuarios u ON v.id_cliente = u.id
    WHERE v.fecha BETWEEN ? AND ?
        `,
      [fechaInicio, fechaFin]
    );

    // se devuelve el resultado o un array vacío si no hay datos
    res.json(results.length > 0 ? results : []);
  } catch (error) {
    // si ocurre algún error se informa al cliente
    res.status(500).json({
      error: "Error en el servidor",
      detalle: error.message,
    });
  }
});



app.post("/api/ventas", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    // 1. Validar presencia del token
    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: "Acceso no autorizado: Token no proporcionado"
        });
    }

    try {
        // 2. Verificar y decodificar el token JWT
        const decoded = jwt.verify(token, llaveSecreta);

        // 4. Obtener datos del body
        const { direccion, metodo_pago, total, productos } = req.body;

        // 5. Validar estructura de la solicitud
        if (!direccion || !metodo_pago || !productos || productos.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Datos de compra incompletos"
            });
        }

        // 6. Validar stock disponible
        for (const producto of productos) {
            const [stockResult] = await conexion.promise().query(
                "SELECT (entradas - salidas) AS stock FROM productos WHERE id = ?",
                [producto.id]
            );

            if (stockResult.length === 0) {
                throw new Error(`Producto ${producto.id} no existe`);
            }

            const stockDisponible = stockResult[0].stock;
            if (stockDisponible < producto.cantidad) {
                throw new Error(
                    `Stock insuficiente para ${producto.nombre}. Disponible: ${stockDisponible}`
                );
            }
        }

        // 7. Insertar venta usando ID del token
        const [resultadoVenta] = await conexion.promise().query(
            "INSERT INTO ventas (id_cliente, fecha, direccion, metodo_pago, total) VALUES (?, NOW(), ?, ?, ?)",
            [decoded.id, direccion, metodo_pago, total]
        );

        const idVenta = resultadoVenta.insertId;

        // 8. Registrar detalles y actualizar stock
        await Promise.all(
            productos.map(async (producto) => {
                // Insertar detalle
                await conexion.promise().query(
                    "INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
                    [idVenta, producto.id, producto.cantidad, producto.precio]
                );

                // Actualizar salidas
                await conexion.promise().query(
                    "UPDATE productos SET salidas = salidas + ? WHERE id = ?",
                    [producto.cantidad, producto.id]
                );
            })
        );

        // 9. Respuesta exitosa
        res.status(201).json({
            success: true,
            data: {
                id_venta: idVenta,
                total: total,
                productos: productos.length
            }
        });

    } catch (error) {
        // 10. Manejo específico de errores JWT
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Token inválido"
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token expirado"
            });
        }

        // 11. Manejo general de errores
        console.error("Error en /api/ventas:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Error al procesar la venta"
        });
    }
});
// =============================================================================================

// Endpoints de las funcinalidades de los Productos
// =============================================================================================

// Obtiene productos ordenados por ventas totales (mas vendidos primero)
app.get("/api/productos/mas-vendidos", async (req, res) => {
  try {
    // Consulta SQL para sumar cantidades vendidas por producto
    const results = await conexion.query(`
            SELECT p.id, p.nombre, SUM(dv.cantidad) as total_vendido
            FROM detalle_ventas dv
            JOIN productos p ON dv.id_producto = p.id  
            GROUP BY p.id 
            ORDER BY total_vendido DESC 
        `);

    // Devuelve array vacio si no hay resultados
    res.json(results.length > 0 ? results : []);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener productos",
      detalle: error.message, // Mensaje detallado para debugging
    });
  }
});

// Busqueda de productos por termino (nombre o descripcion)
app.get("/api/productos/buscar", async (req, res) => {
  const termino = req.query.termino; // Obtener parametro de busqueda

  try {
    // Busqueda con comodines % para coincidencias parciales
    const [productos] = await conexion.promise().query(
      "SELECT id, nombre, precio, categoria FROM productos WHERE nombre LIKE ? OR descripcion LIKE ?",
      [`%${termino}%`, `%${termino}%`] // Ej: 'bici' encuentra 'bicicleta'
    );

    // Construir URL completa para imagenes
    productos.forEach((producto) => {
      producto.imagen_url = producto.imagen
        ? `/uploads/${producto.imagen}` // Ruta completa si existe imagen
        : null; // Null si no hay imagen
    });

    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar productos" });
  }
});

// =======================================
// Endpoints por la categoria de productos
// =======================================

// Obtener bicicletas
app.get("/api/productos/bicicletas", async (req, res) => {
  try {
    const productos = await obtenerProductosPorCategoria("Bicicletas");
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener bicicletas" });
  }
});

// Obtener accesorios (logica identica a bicicletas)
app.get("/api/productos/accesorios", async (req, res) => {
  try {
    const productos = await obtenerProductosPorCategoria("Accesorios");
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener accesorios" });
  }
});

// Obtener repuestos (logica identica a anteriores)
app.get("/api/productos/repuestos", async (req, res) => {
  try {
    const productos = await obtenerProductosPorCategoria("Repuestos");
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener repuestos" });
  }
});

// Productos destacados (flag destacado = 1)
app.get("/api/productos/destacados", async (req, res) => {
  try {
    // Consulta directa para productos destacados
    const [productos] = await conexion
      .promise()
      .query("SELECT * FROM productos WHERE destacado = 1");

    // Log para ver resultados en consola
    console.log("[Destacados] Productos encontrados:", productos);

    // Agregar propiedad imagen_url a cada producto
    productos.forEach((producto) => {
      producto.imagen_url = `/uploads/${producto.imagen}`;
    });

    res.json(productos);
  } catch (error) {
    console.error("[Error] En consulta destacados:", error);
    res.status(500).json({ error: "Error al obtener productos destacados" });
  }
});

// ======================================
// CRUD de productos
// ======================================

// Crear nuevo producto (con imagen opcional)
app.post("/api/productos", upload.single("imagen"), async (req, res) => {
  try {
    // Procesar datos del formulario
    const productoData = {
      nombre: req.body.nombre,
      precio: parseFloat(req.body.precio), // Convertir a decimal
      descripcion: req.body.descripcion,
      marca: req.body.marca,
      imagen: req.file ? req.file.filename : null, // Guardar nombre de archivo si existe
      destacado: req.body.destacado === "true" ? 1 : 0, // Convertir booleano
      categoria: req.body.categoria,
      entradas: parseInt(req.body.entradas) || 0, // Valor por defecto 0
    };

    // Llamar a funcion de creacion
    const resultado = await crear("productos", productoData);
    res.status(201).json(resultado); // Codigo 201: creado exitosamente
  } catch (error) {
    res.status(500).json({
      message: "Error al crear producto",
      error: error.message, // Mensaje de error especifico
    });
  }
});

// Actualizar producto (con logs detallados)
app.put("/api/productos/:id", upload.single("imagen"), async (req, res) => {
  try {
    // Log de datos recibidos
    console.log("[Actualizar] ID:", req.params.id);
    console.log(
      "[Actualizar] Datos crudos:",
      JSON.stringify(req.body, null, 2)
    );
    console.log(
      "[Actualizar] Archivo:",
      req.file ? req.file.filename : "Ninguno"
    );

    // Preparar datos para actualizacion
    const productoData = {
      nombre: req.body.nombre,
      precio: parseFloat(req.body.precio),
      descripcion: req.body.descripcion,
      marca: req.body.marca,
      imagen: req.file ? req.file.filename : req.body.imagen_actual, // Mantener imagen actual si no hay nueva
      destacado: req.body.destacado === "true" ? 1 : 0,
      categoria: req.body.categoria,
      entradas: parseInt(req.body.entradas),
    };

    console.log("[Actualizar] Datos procesados:", productoData);

    // Ejecutar actualizacion
    const resultado = await actualizar(
      "productos",
      req.params.id,
      productoData
    );
    res.json({
      message: "Producto actualizado correctamente",
      data: resultado, // Datos devueltos de la operacion
    });
  } catch (error) {
    console.error("[Error] En PUT producto:", error);
    res.status(500).json({
      message: "Error al actualizar producto",
      error: error.message,
      sqlError: error.sqlMessage, // Mensaje de error de MySQL
    });
  }
});

// Eliminar producto (con validacion de ID)
app.delete("/api/productos/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  // Validar que el ID sea numerico
  if (isNaN(id)) {
    return res.status(400).json({ error: "ID invalido" });
  }

  try {
    console.log("[Eliminar] ID producto:", req.params.id);
    const resultado = await eliminar("productos", req.params.id);
    res.json({
      message: "Producto eliminado correctamente",
      data: resultado, // Resultado de la operacion
    });
  } catch (error) {
    console.error("[Error] En DELETE producto:", error);
    res.status(500).json({
      message: "Error al eliminar producto",
      error: error.message,
      sqlError: error.sqlMessage, // Error especifico de SQL
    });
  }
});
// =============================================================================================

// Endpoins de los Clientes:
// ======================================

// =======================
// Endpoint de Registro de clientes
// ========================

// Crear nuevo usuario con contraseña encriptada
app.post("/api/register", async (req, res) => {
  console.log("[Registro] Datos recibidos:", req.body);
  const { correo, contraseña } = req.body;

  // Validar campos requeridos
  if (!correo || !contraseña) {
    return res.status(400).json({ message: "Campos requeridos faltantes" });
  }

  try {
    // Verificar si el correo ya existe
    const correoExiste = await new Promise((resolve, reject) => {
      conexion.query(
        "SELECT * FROM usuarios WHERE correo = ?",
        [correo],
        (error, resultados) => {
          if (error) return reject(error);
          resolve(resultados.length > 0);
        }
      );
    });

    if (correoExiste) {
      return res.status(409).json({ message: "Correo ya registrado" });
    }

    // Encriptar contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Crear objeto usuario
    const nuevoUsuario = { ...req.body, contraseña: hashedPassword };

    // Insertar en base de datos
    await conexion.query("INSERT INTO usuarios SET ?", nuevoUsuario);
    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    console.error("[Error] En registro:", error);
    res.status(500).json({ message: "Error en servidor", error });
  }
});

// ========================
// Endpoint de inicio de sesión
// ========================
app.post("/api/login", async (req, res) => {
  const { correo, contraseña } = req.body;

  // Verifica que en caso de que el usuario no llene un campo, se envíe un mensaje de error
  if (!correo || !contraseña) {
    return res
      .status(400)
      .json({ message: "Todos los campos son obligatorios" });
  }

  // Login para el administrador
  const esAdministrador = await new Promise((resolve, reject) => {
    // conexion.query() es asíncrona: no se puede saber cuando terminará. await pausa la ejecución hasta que este proceso termine.
    conexion.query(
      'SELECT * FROM usuarios WHERE correo = ? AND rol = "Administrador"',
      [correo],
      (error, resultados) => {
        if (error) {
          return reject(error);
        }
        resolve(resultados.length === 1);
      }
    );
  });

  if (esAdministrador) {
    return res
      .status(201)
      .json({
        message: "Bienvenido Administrador, has iniciado sesion correctamente",
      });
  }

  // Buscar el usuario en la base de datos
  conexion.query(
    'SELECT * FROM usuarios WHERE correo = ? AND rol = "Cliente"',
    [correo],
    async (error, resultados) => {
      // Si hay un error con la conexión a la base de datos
      if (error) {
        return res.status(500).json({ message: "Error en el servidor", error });
      }

      // Si el usuario no existe en la base de datos
      if (resultados.length === 0) {
        return res.status(401).json({ message: "El usuario no existe" });
      }

      const usuario = resultados[0];

      //Se comparan las contraseñas
      const contraseñaCorrecta = await bcrypt.compare(
        contraseña,
        usuario.contraseña
      );

      if (!contraseñaCorrecta) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }

      // Generar el token JWT
      const token = jwt.sign(
        { id: usuario.id, correo: usuario.correo },
        llaveSecreta,
        { expiresIn: "30m" } //Tiempo de expiración
      );

      // Responder a las peticiones con un mensaje y el token
      res.status(200).json({ message: "Inicio de sesion exitoso", token });
    }
  );
});

// ======================================
// Endpoint para obtener datos del usuario desde el token JWT
// ======================================
app.get("/api/user", (req, res) => {
  // Extraer token del header Authorization (formato: Bearer <token>)
  const token = req.headers.authorization?.split(" ")[1];

  // Validar presencia de token
  if (!token) {
    return res.status(401).json({ message: "Se requiere autenticacion" });
  }

  try {
    // Verificar y decodificar token usando la clave secreta
    const decoded = jwt.verify(token, llaveSecreta);
    const usuarioId = decoded.id; // Obtener ID del payload del token

    // Consultar solo nombre y rol del usuario
    conexion.query(
      "SELECT nombre, rol FROM usuarios WHERE id = ?",
      [usuarioId],
      (error, resultados) => {
        if (error) return res.status(500).json({ error }); // Error de base de datos
        if (resultados.length === 0)
          return res.status(404).json({ message: "Usuario no registrado" }); // ID no existe

        res.status(200).json(resultados[0]); // Devolver datos publicos del usuario
      }
    );
  } catch (error) {
    // Manejar errores de token expirado o invalido
    return res.status(401).json({ message: "Token no valido o expirado" });
  }
});

// ======================================
// Endpoint para verificar disponibilidad de email
// ======================================
app.post("/api/check-email", async (req, res) => {
  const { email } = req.body;
  console.log("[Verificacion] Email recibido:", email);

  try {
    // Consulta rapida para detectar duplicados
    const [user] = await conexion
      .promise()
      .query("SELECT * FROM usuarios WHERE correo = ?", [email]);

    const existe = user.length > 0; // true si hay coincidencias
    console.log(
      `[Verificacion] Estado email ${email}: ${
        existe ? "ocupado" : "disponible"
      }`
    );

    res.status(200).json({ existe }); // Respuesta simple booleana
  } catch (error) {
    res.status(500).json({
      error: "Fallo en verificacion de email",
      detalle: error.message, // Incluir detalle solo en desarrollo
    });
  }
});

// ===============================================
// Endpoint para restablecer contraseña de usuario
// ===============================================

app.post("/api/reset-password", async (req, res) => {
  const { email, nuevaContraseña } = req.body; // Extraer parametros del body

  try {
    // Generar hash seguro de la nueva contraseña (salt rounds = 10)
    const hashedPassword = await bcrypt.hash(nuevaContraseña, 10);

    // Actualizar contraseña en la base de datos
    await conexion.promise().query(
      "UPDATE usuarios SET contraseña = ? WHERE correo = ?", // Query parametrizado
      [hashedPassword, email] // Valores para prevenir SQL injection
    );

    res.json({
      success: true,
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    console.error("[Error] Restableciendo contraseña:", error);
    res.status(500).json({
      success: false,
      error: "Fallo en actualizacion de contraseña",
      detalle: process.env.NODE_ENV === "development" ? error.message : null, // Detalle solo en dev
    });
  }
});

// ======================================

// ==================================================================
// Rutas genericas para el registro de usuarios (Panel Administrador)
// ==================================================================

//En este caso de definio un CRUD genérico en donde se utilizarán rutas dinamicas basadas en la tabla que el usuario especifique.
//Todos los registross de una tabla especifica:
app.get("/api/:tabla", async (req, res) => {
  try {
    const resultados = await obtenerTodos(req.params.tabla);
    res.send(resultados);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Obtener un registro de una tabla especifica por su id:
app.get("/api/:tabla/:id", async (req, res) => {
  try {
    const resultado = await obtenerUno(req.params.tabla, req.params.id);
    res.send(resultado);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Agregar o crear un registro en una tabla especifica:
app.post("/api/:tabla", async (req, res) => {
  try {
    const { tabla } = req.params; // Nombre de la tabla desde la URL
    const datos = req.body; // Datos recibidos del cliente

    // Validar si es tabla de usuarios
    // Solo aplicamos lógica especial para la tabla 'usuarios'
    if (tabla === "usuarios") {
      // Creamos una PROMESA para que el código espere la respuesta del query (porque `conexion.query` no es async/await nativamente)
      const correoExiste = await new Promise((resolve, reject) => {
        // Ejecutamos el query para buscar si el correo ya existe
        conexion.query(
          "SELECT * FROM usuarios WHERE correo = ?", // Consulta SQL
          [datos.correo], // Parámetro: correo que se está registrando
          (error, resultados) => {
            // Callback que se ejecuta cuando termina la consulta
            if (error) {
              // Si hay un error con la base de datos, RECHAZAMOS la promesa y se manda el error
              return reject(error);
            }

            // Si no hay error, RESOLVEMOS la promesa con un valor booleano:
            // true  → si ya hay resultados (el correo ya está en uso)
            // false → si no hay resultados (el correo está disponible)
            resolve(resultados.length > 0);
          }
        );
      });

      // Si la promesa nos devolvió true → el correo ya está en la base de datos
      if (correoExiste) {
        // Enviamos una respuesta con status 409 (conflict) porque el correo ya está registrado
        return res
          .status(409)
          .json({ message: "Este correo ya está vinculado a una cuenta" });
      }
      // **Encriptar contraseña**
      try {
        const hashedPassword = await bcrypt.hash(datos.contraseña, 10);
        datos.contraseña = hashedPassword; // Reemplazamos la contraseña plana
      } catch (error) {
        return res.status(500).json({
          message: "Fallo al encriptar la contraseña",
          error,
        });
      }
    }

    //  **Crear registro en la tabla**
    // Usamos función 'crear' para insertar en cualquier tabla
    const resultado = await crear(tabla, datos);

    //**Respuesta exitosa**
    res.send(resultado);
  } catch (error) {
    // **MANEJO DE ERRORES GENERALES**
    console.error(` Error en endpoint /api/${tabla}:`, error); // Log detallado

    res.status(500).json({
      message: `Error al crear registro en ${tabla}`,
      error: error.message, // Solo enviamos el mensaje para evitar exponer detalles sensibles
    });
  }
});

// actualizar un registro en una tabla especifica por su id:
app.put("/api/:tabla/:id", async (req, res) => {
  try {
    const resultado = await actualizar(
      req.params.tabla,
      req.params.id,
      req.body
    );
    res.send(resultado);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Eliminar un registro en una tabla especifica por su id:
app.delete("/api/:tabla/:id", async (req, res) => {
  try {
    const resultado = await eliminar(req.params.tabla, req.params.id);
    res.send(resultado);
  } catch (error) {
    res.status(500).send(error);
  }
});

//Se realiza o no la conexión
const puerto = process.env.PUERT || 3600;
app.listen(puerto, () => {
  console.log("Servidor corriendo en el puerto:", puerto);
});
