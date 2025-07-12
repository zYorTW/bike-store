create database bikeStore;
use bikeStore;
create table usuarios(
	id int primary key auto_increment,
    nombre varchar(50),
    apellido varchar(50),
	cedula varchar(20),
    telefono varchar(20),
    correo varchar(225),
	rol enum("Cliente", "Administrador") default "cliente",
    contraseña varchar(255)
);

select * from usuarios;

create table productos(
	id int primary key auto_increment,
    nombre varchar(225),
	precio DECIMAL(10,2),
    descripcion varchar(225),
	imagen varchar(255),
    marca varchar(50),
    categoria enum("Bicicletas", "Accesorios", "Repuestos"),
    destacado boolean,
    entradas int,
    salidas int,
	stock INT AS (entradas - salidas) VIRTUAL default 0
);

select * from productos;


create table ventas(
	id int primary key auto_increment,
    id_cliente int, 
    foreign key(id_cliente) references usuarios(id), 
    fecha date,
    direccion varchar(255),
    metodo_pago enum("Efectivo", "Tarjeta", "Transferencia" ),
	total double
);

select * from ventas;


create table detalle_ventas(
	id int primary key auto_increment,
    id_venta int,
    id_producto int,
    foreign key(id_venta) references ventas(id), 
    foreign key(id_producto) references productos(id),
    cantidad int,
	precio_unitario double
);

INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario)
VALUES 
(1, 2, 3, 25.50),  -- 3 unidades del producto 2 para la venta 1
(1, 4, 1, 74.00),  -- 1 unidad del producto 4 para la venta 1
(2, 1, 5, 15.05),  -- 5 unidades del producto 1 para la venta 2
(3, 3, 2, 100.00); -- 2 unidades del producto 3 para la venta 3

select * from detalle_ventas;

