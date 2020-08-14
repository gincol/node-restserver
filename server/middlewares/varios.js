let existeUsuario = (req, res, next) => {
  let id = req.params.id;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      ok: false,
      err: {
        message: "Usuario no encontrado",
      },
    });
  }
  next();
};

module.exports = {
  existeUsuario,
};
