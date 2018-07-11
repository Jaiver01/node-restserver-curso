const express = require('express');
const {verificaToken, verificaAdminRole}=require('../middlewares/autenticacion');
const app = express();

const Producto = require('../models/producto');

app.get('/producto', (req, res)=>{
	let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

	Producto.find({disponible:true})
	.skip(desde)
    .limit(limite)
    .sort('nombre')
    .populate('usuario', 'nombre email')
    .populate('categoria', 'descripcion')
    .exec((err, productos) =>{
		if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            productos
        });
	});
});

app.get('/producto/:id', (req, res)=>{
	let id = req.params.id;

	Producto.findById(id)
	.populate('usuario', 'nombre email')
    .populate('categoria', 'descripcion')
	.exec((err, producto) =>{
		if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto
        });
	});
});

app.get('/producto/buscar/:termino', verificaToken, (req, res)=>{
	let termino = req.params.termino;
	let regex=new RegExp(termino, 'i');

	Producto.find({nombre: regex})
    .populate('categoria', 'nombre')
	.exec((err, productos) =>{
		if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            productos
        });
	});
});

app.post('/producto', verificaToken, (req, res)=>{
	let body = req.body;

    let producto = new Producto({
    	nombre: body.nombre,
		precioUni: body.precioUni,
		descripcion: body.descripcion,
		categoria: body.categoria,
		disponible: body.disponible,
		usuario: req.usuario._id
    });


    producto.save((err, productoDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });


    });
});

app.put('/producto/:id', verificaToken, (req, res)=>{
	let id = req.params.id;

    Producto.findByIdAndUpdate(id, {
    	descripcion: req.body.descripcion,
    	nombre: req.body.nombre,
    	precioUni: req.body.precioUni
    }, { new: true }, (err, productoDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });

    })
});

app.delete('/producto/:id', verificaToken, (req, res)=>{
	let id = req.params.id;

    Producto.findByIdAndUpdate(id, {
    	disponible:false
    }, { new: true }, (err, productoDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });

    })
});


module.exports=app;