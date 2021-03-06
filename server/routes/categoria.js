const express = require('express');
const {verificaToken, verificaAdminRole}=require('../middlewares/autenticacion');
const app = express();

const Categoria = require('../models/categoria');

app.get('/categoria', (req, res)=>{
	Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) =>{
		if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categorias
        });
	});
});

app.get('/categoria/:id', (req, res)=>{
	let id = req.params.id;
	Categoria.findById(id, (err, categoria) =>{
		if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria
        });
	});
});

app.post('/categoria', verificaToken, (req, res)=>{
	let body = req.body;

    let categoria = new Categoria({
    	descripcion: body.descripcion,
    	usuario: req.usuario._id
    });


    categoria.save((err, categoriaDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });


    });
});

app.put('/categoria/:id', verificaToken, (req, res)=>{
	let id = req.params.id;

    Categoria.findByIdAndUpdate(id, {descripcion: req.body.descripcion}, { new: true, runValidators: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    })
});

app.delete('/categoria/:id', [verificaToken, verificaAdminRole], (req, res)=>{
	let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
    	if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            message: 'Categoria Borrada',
            categoria: categoriaBorrada
        });
    });
});


module.exports=app;