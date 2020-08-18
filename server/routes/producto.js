const express = require("express");
const bcrypt = require("bcrypt");
const _ = require("underscore");
const Categoria = require("../models/categoria");
const Usuario = require("../models/usuario");
const Producto = require("../models/producto");
const { verificaToken } = require("../middlewares/autenticacion");
const { existeObjeto } = require("../middlewares/varios");

const app = express();

module.exports = app;

// ==========================
// Obtener productos
// ==========================
app.get("/producto", verificaToken, (req, res) => {
  // trae todos los productos
  // populate: usuario categoria
  // paginado

  let desde = Number(req.query.desde) || 0;
  let limite = Number(req.query.limite) || 5;

  Producto.find({ disponible: true })
    .skip(desde)
    .limit(limite)
    .populate("usuario", "nombre email")
    .populate("categoria", "descripcion")
    .exec((err, productos) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      Producto.countDocuments({ disponible: true }, (err, conteo) => {
        res.json({
          ok: true,
          productos,
          cuantos: conteo,
        });
      });
    });
});

// ==========================
// Obtener un producto por ID
// ==========================
app.get("/producto/:id", [verificaToken, existeObjeto], (req, res) => {
  // trae un producto
  // populate: usuario categoria
  let id = req.params.id;

  //Categoria.find({ _id: id }).exec((err, categoriaDB) => {
  Producto.findById(id)
    .populate("usuario", "nombre email")
    .populate("categoria", "descripcion")
    .exec((err, productoDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }

      if (!productoDB) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "Producto no encontrado",
          },
        });
      }

      res.json({
        ok: true,
        producto: productoDB,
      });
    });
});

// ==========================
// Buscar productos
// ==========================
app.get("/producto/buscar/:termino", verificaToken, (req, res) => {
  let termino = req.params.termino;
  let regex = new RegExp(termino, "i");
  console.log("regex ", regex);
  Producto.find({ nombre: regex })
    .populate("categoria", "descripcion")
    .exec((err, productos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        productos,
      });
    });
});

// ==========================
// Crear un nuevo producto
// ==========================
app.post("/producto", verificaToken, (req, res) => {
  // grabar un usuario
  // grabar la categoria
  let body = req.body;

  let producto = new Producto({
    nombre: body.nombre,
    precioUni: body.precio,
    descripcion: body.descripcion,
    categoria: body.categoria,
    usuario: req.usuario._id,
  });

  producto.save((err, productoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    if (!producto) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    res.status(201).json({
      ok: true,
      producto: productoDB,
    });
  });
});

// ==========================
// Actualizar un producto
// ==========================
app.put("/producto/:id", [verificaToken, existeObjeto], (req, res) => {
  let id = req.params.id;
  let body = req.body;

  Producto.findById(id, (err, productoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    if (!productoDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "Producto no existe",
        },
      });
    }

    productoDB.nombre = body.nombre;
    productoDB.descripcion = body.descripcion;
    productoDB.categoria = body.categoria;
    productoDB.disponible = body.disponible;
    productoDB.precioUni = body.precio;

    productoDB.save((err, productoGuardado) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        producto: productoGuardado,
      });
    });
  });
});

// ==========================
// Borrar un producto
// ==========================
app.delete("/producto/:id", [verificaToken, existeObjeto], (req, res) => {
  // cambiar disponible a false

  let id = req.params.id;

  let CambiaEstado = {
    disponible: false,
  };

  Producto.findByIdAndUpdate(
    id,
    CambiaEstado,
    { new: true },
    (err, productoBorrado) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err: err,
        });
      }

      if (!productoBorrado) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "Producto no encontrado",
          },
        });
      }

      res.json({
        ok: true,
        producto: productoBorrado,
        message: "Producto borrado",
      });
    }
  );
});
