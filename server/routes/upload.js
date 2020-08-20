const express = require("express");
const fileUpload = require("express-fileupload");
const app = express();
const Usuario = require("../models/usuario");
const Producto = require("../models/producto");
const { findLastIndex } = require("underscore");
const fs = require("fs");
const path = require("path");

// default options
app.use(fileUpload({ useTempFiles: true }));

app.put("/upload/:tipo/:id", function (req, res) {
  let tipo = req.params.tipo;
  let id = req.params.id;
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: "No files were uploaded.",
      },
    });
  }
  let archivo = req.files.archivo;

  // validar tipo
  let tiposValidos = ["producto", "usuario"];
  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: "Los tipos permitidos son " + tiposValidos.join(", "),
        tipo: tipo,
      },
    });
  }

  // extensiones permitidas
  let extensionesValidas = ["png", "jpg", "gif", "jpeg"];
  let nombreArchivoCortado = archivo.name.split(".");
  let extension = nombreArchivoCortado[nombreArchivoCortado.length - 1];

  if (extensionesValidas.indexOf(extension.toLowerCase()) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message:
          "Las extensiones permitidas son " + extensionesValidas.join(", "),
        ext: extension.toLowerCase(),
      },
    });
  }

  // Cambiar nombre archivo
  let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

  archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }
    if (tipo === "usuario") {
      imagenUsuario(id, res, nombreArchivo);
    } else {
      imagenProducto(id, res, nombreArchivo);
    }
  });
});

function imagenUsuario(id, res, nombreArchivo) {
  Usuario.findById(id, (err, usuarioDB) => {
    if (err) {
      borraArchivo(nombreArchivo, "usuario");
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    if (!usuarioDB) {
      borraArchivo(nombreArchivo, "usuario");
      return res.status(400).json({
        ok: true,
        err: {
          message: "Usuario no existe",
        },
      });
    }

    borraArchivo(usuarioDB.img, "usuario");

    usuarioDB.img = nombreArchivo;
    usuarioDB.save((err, usuarioGuardado) => {
      res.json({
        ok: true,
        usuario: usuarioGuardado,
        img: nombreArchivo,
      });
    });
  });
}

function imagenProducto(id, res, nombreArchivo) {
  Producto.findById(id, (err, productoDB) => {
    if (err) {
      borraArchivo(nombreArchivo, "producto");
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    if (!productoDB) {
      borraArchivo(nombreArchivo, "producto");
      return res.status(400).json({
        ok: true,
        err: {
          message: "Producto no existe",
        },
      });
    }

    borraArchivo(productoDB.img, "producto");

    productoDB.img = nombreArchivo;
    productoDB.save((err, productoGuardado) => {
      res.json({
        ok: true,
        producto: productoGuardado,
        img: nombreArchivo,
      });
    });
  });
}

function borraArchivo(nombreImagen, tipo) {
  let pathImagen = path.resolve(
    __dirname,
    `../../uploads/${tipo}/${nombreImagen}`
  );
  if (fs.existsSync(pathImagen)) {
    fs.unlinkSync(pathImagen);
  }
}
module.exports = app;
