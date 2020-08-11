// =================
// Puerto
// =================
process.env.PORT = process.env.PORT || 3000;

// =================
// Entorno
// =================
process.env.NODE_ENV = process.env.NODE_ENV || "heroku";

// =================
// Base de datos
// =================
let urlDB;
if (process.env.NODE_ENV === "dev") {
  urlDB = "mongodb://localhost:27017/cafe";
} else {
  urlDB =
    "mongodb+srv://gincol:ekbiQ85evKayd8Bf@cluster0.dwo71.mongodb.net/cafe";
}
process.env.URLDB = urlDB;
