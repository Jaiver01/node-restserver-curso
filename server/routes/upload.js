const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario=require('../models/usuario');
const Producto=require('../models/producto');

const fs=require('fs');
const path=require('path');

// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', function(req, res) {

	let tipo=req.params.tipo;
	let id=req.params.id;

	if (!req.files){
		return res.status(400).json({
			ok: false,
			err:{
				message: 'No se ha seleccionado ningún archivo.'
			}
		});
	}

	let tiposPermitidos=['usuarios', 'productos'];

	if(tiposPermitidos.indexOf(tipo)<0){
		return res.status(500).json({
			ok: false,
			err: {
				message: 'Los tipos permitidos son: '+tiposPermitidos.join(', '),
				tipo: tiposPermitidos
			}
		});
	}

	// The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
	let archivo = req.files.archivo;
	let nombreArchivoCortado=archivo.name.split('.');
	let extension=nombreArchivoCortado[nombreArchivoCortado.length-1];

	//Extensiones permitidas
	let extensionesValidas=['png', 'jpg','gif', 'jpeg'];

	if(extensionesValidas.indexOf(extension)<0){
		return res.status(500).json({
			ok: false,
			err: {
				message: 'Las extensiones permitidas son: '+extensionesValidas.join(', '),
				ext: extension
			}
		});
	}

	let nombreArchivo=`${id}-${new Date().getMilliseconds()}.${extension}`;

	// Use the mv() method to place the file somewhere on your server
	archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err)=>{
		if (err){
			return res.status(500).json({
				ok: false,
				err
			});
		}

		//Guardar ruta imagen en la db
		tipo==='usuarios'?imagenUsuario(id, res, nombreArchivo) : imagenProducto(id, res, nombreArchivo);
	});

});

function imagenUsuario(id, res, nombreArchivo){
	Usuario.findById(id, (err, usuarioDB)=>{
		if (err){
			borraArchivo(nombreArchivo, 'usuarios');
			return res.status(500).json({
				ok: false,
				err
			});
		}

		if (!usuarioDB){
			borraArchivo(nombreArchivo, 'usuarios');
			return res.status(400).json({
				ok: false,
				err:{
					message: 'Usuario no existe'
				}
			});
		}

		borraArchivo(usuarioDB.img, 'usuarios');

		usuarioDB.img=nombreArchivo;

		usuarioDB.save((err, usuarioGuardado)=>{
			res.json({
				ok: true,
				usuario: usuarioGuardado,
				img: nombreArchivo
			});
		});
	});
}

function imagenProducto(id, res, nombreArchivo){
	Producto.findById(id, (err, productoDB)=>{
		if (err){
			borraArchivo(nombreArchivo, 'productos');
			return res.status(500).json({
				ok: false,
				err
			});
		}

		if (!productoDB){
			borraArchivo(nombreArchivo, 'productos');
			return res.status(400).json({
				ok: false,
				err:{
					message: 'Producto no existe'
				}
			});
		}

		borraArchivo(productoDB.img, 'productos');

		productoDB.img=nombreArchivo;

		productoDB.save((err, productoGuardado)=>{
			res.json({
				ok: true,
				producto: productoGuardado,
				img: nombreArchivo
			});
		});
	});
}

function borraArchivo(nombreImagen, tipo){console.log(nombreImagen, tipo);
	let pathImagen=path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
	if(fs.existsSync(pathImagen)){
		fs.unlinkSync(pathImagen);
	}
}


module.exports=app;