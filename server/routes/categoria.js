const express = require("express");
const bcrypt = require("bcrypt");
const _ = require("underscore");
const Categoria = require("../models/categoria");
const Usuario = require("../models/usuario");
const {
  verificaToken,
  verificaAdminRol,
} = require("../middlewares/autenticacion");
const { existeObjeto } = require("../middlewares/varios");

const app = express();

// =============================
// Mostrar todas las categorias
// =============================
app.get("/categoria", verificaToken, (req, res) => {
  Categoria.find()
    .sort("descripcion")
    .populate("usuario", "nombre email")
    .exec((err, categorias) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err: err.message,
        });
      }

      if (!categorias) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      //Categoria.countDocuments((err, conteo) => {
      res.json({
        ok: true,
        categorias,
        //cuantos: conteo,
      });
      //});
    });
});

// =============================
// Mostrar una categoria por ID
// =============================
app.get("/categoria/:id", [verificaToken, existeObjeto], (req, res) => {
  let id = req.params.id;

  //Categoria.find({ _id: id }).exec((err, categoriaDB) => {
  Categoria.findById(id, (err, categoriaDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    if (!categoriaDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "Categoria no encontrada",
        },
      });
    }

    res.json({
      ok: true,
      categoriaDB,
    });
  });
});

// =============================
// Crear una categoria
// =============================
app.post("/categoria", [verificaToken, verificaAdminRol], (req, res) => {
  // regresa la nueva categoria
  // req.usuario._id - id de la persona que crea la categoria
  let body = req.body;

  let categoria = new Categoria({
    descripcion: body.descripcion,
    usuario: req.usuario._id,
  });

  categoria.save((err, categoriaDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    if (!categoriaDB) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    res.json({
      ok: true,
      categoria: categoriaDB,
    });
  });
});

// =============================
// Actualizar una categoria
// =============================
app.put(
  "/categoria/:id",
  [verificaToken, verificaAdminRol, existeObjeto],
  (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Categoria.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true, context: "query" },
      (err, categoriaDB) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            err,
          });
        }

        if (!categoriaDB) {
          return res.status(400).json({
            ok: false,
            err,
          });
        }

        res.json({
          ok: true,
          categoria: categoriaDB,
        });
      }
    );
  }
);

// =============================
// Eliminar una categoria
// =============================
app.delete(
  "/categoria/:id",
  [verificaToken, verificaAdminRol, existeObjeto],
  (req, res) => {
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }
      console.log("categoriaBorrada: ", categoriaBorrada);
      if (!categoriaBorrada) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "Categoria no encontrada",
          },
        });
      }

      res.json({
        ok: true,
        categoria: categoriaBorrada,
      });
    });
  }
);

module.exports = app;
