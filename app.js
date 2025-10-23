const express = require("express");
const path = require("path");
const cors = require("cors");
const { getPresensiData, deletePresensiData } = require("./config/db");

const app = express();
const port = 3000;

// Middleware umum
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS hanya untuk frontend tertentu
app.use(cors({
  origin: "http://127.0.0.1:8080", // frontend
  methods: ["GET", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));

// Middleware statis
app.use("/images", express.static(path.join(__dirname, "data/images")));
app.use(express.static(path.join(__dirname, "public")));

// Endpoint root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Endpoint ambil data presensi
app.get("/presence", (req, res) => {
  getPresensiData((err, rows) => {
    if (err) {
      console.error("Gagal mengambil data:", err);
      return res.status(500).send("Error retrieving presensi data");
    }

    const data = rows.map(row => ({
      ...row,
      image_url: row.image_url ? `/images/${path.basename(row.image_url)}` : null
    }));

    res.json(data);
  });
});

// Endpoint hapus data presensi
app.delete("/presence/:id", (req, res) => {
  const { id } = req.params;
  console.log(`Menghapus presensi dengan ID: ${id}`);

  deletePresensiData(id, (err) => {
    if (err) {
      console.error("Gagal menghapus data:", err);
      return res.status(500).send("Error deleting presensi data");
    }

    console.log(`Presensi dengan ID ${id} berhasil dihapus`);
    res.status(200).send("Presensi deleted successfully");
  });
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
