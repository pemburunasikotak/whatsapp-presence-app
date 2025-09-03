const express = require("express");
const path = require("path");
const { getPresensiData, deletePresensiData } = require("./config/db");
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware untuk melayani gambar
app.use("/images", express.static(path.join(__dirname, "data/images")));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use(cors({
   origin: 'http://127.0.0.1:8080'  // Hanya memperbolehkan frontend yang berjalan di port 3000
}));

// Endpoint untuk mendapatkan data presensi
app.get("/presensi", (req, res) => {
  getPresensiData((err, rows) => {
    if (err) {
      res.status(500).send("Error retrieving presensi data");
    } else {
      // Menambahkan URL gambar di setiap entri presensi
      rows.forEach((row) => {
        if (row.image_url) {
          row.image_url = `/images/${path.basename(row.image_url)}`;
        }
      });
      res.json(rows);
    }
  });
});
app.delete("/presensi/:id", (req, res) => {
  const { id } = req.params;
  console.log(`Menghapus presensi dengan ID: ${id}`); // Log untuk mengecek ID yang diterima

  deletePresensiData(id, (err) => {
    if (err) {
      console.error("Gagal menghapus data:", err);
      res.status(500).send("Error deleting presensi data");
    } else {
      console.log(`Presensi dengan ID ${id} berhasil dihapus`);
      res.status(200).send("Presensi deleted successfully");
    }
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
