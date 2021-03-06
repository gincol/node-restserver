const express = require("express");
const bcrypt = require("bcrypt");
const _ = require("underscore");
const Usuario = require("../models/usuario");
const {
  verificaToken,
  verificaAdminRol,
} = require("../middlewares/autenticacion");
const { existeObjeto } = require("../middlewares/varios");
const { response } = require("express");

const app = express();

app.get("/", function (req, res) {
  res.json("Hello World");
});

//RECUPERAR TODOS
app.get("/usuario", verificaToken, function (req, res) {
  let desde = Number(req.query.desde) || 0;
  let limite = Number(req.query.limite) || 5;

  Usuario.find({ estado: true })
    .skip(desde)
    .limit(limite)
    .exec((err, usuarios) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      Usuario.countDocuments({ estado: true }, (err, conteo) => {
        res.json({
          ok: true,
          usuarios,
          cuantos: conteo,
        });
      });
    });
});

//RECUPERAR UN USUARIO
app.get("/usuario/:id", [verificaToken, existeObjeto], function (req, res) {
  let id = req.params.id;

  Usuario.find({ _id: id, estado: true }).exec((err, usuario) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    res.json({
      ok: true,
      usuario,
    });
  });
});

//CREAR
app.post("/usuario", [verificaToken, verificaAdminRol], function (req, res) {
  let body = req.body;

  let usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    role: body.role,
  });

  usuario.save((err, usuarioDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    res.json({
      ok: true,
      usuario: usuarioDB,
    });
  });
});

//ACTUALIZAR
app.put(
  "/usuario/:id",
  [verificaToken, verificaAdminRol, existeObjeto],
  function (req, res) {
    let id = req.params.id;

    let body = _.pick(req.body, ["nombre", "email", "img", "role", "status"]);

    Usuario.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true, context: "query" },
      (err, usuarioDB) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            err,
          });
        }

        res.json({
          ok: true,
          usuario: usuarioDB,
        });
      }
    );
  }
);

//BORRA CAMBIANDO ESTADO
app.delete(
  "/usuario/:id",
  [verificaToken, verificaAdminRol, existeObjeto],
  function (req, res) {
    let id = req.params.id;

    let CambiaEstado = {
      estado: false,
    };

    Usuario.findByIdAndUpdate(
      id,
      CambiaEstado,
      { new: true },
      (err, usuarioBorrado) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            err: err,
          });
        }

        if (!usuarioBorrado) {
          return res.status(400).json({
            ok: false,
            err: {
              message: "Usuario no encontrado",
            },
          });
        }

        res.json({
          ok: true,
          usuario: usuarioBorrado,
        });
      }
    );
  }
);

//BORRRA FISICAMENTE
// app.delete("/usuario/:id", function (req, res) {
//   let id = req.params.id;

//   Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
//     if (err) {
//       return res.status(400).json({
//         ok: false,
//         err,
//       });
//     }
//     if (!usuarioBorrado) {
//       return res.status(400).json({
//         ok: false,
//         err: {
//           message: "Usuario no encontrado",
//         },
//       });
//     }

//     res.json({
//       ok: true,
//       usuario: usuarioBorrado,
//     });
//   });
// });

module.exports = app;
