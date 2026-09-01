const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../presensi.db'));

// db.all("PRAGMA table_info(presensi);", [], (err, rows) => {
//   if (err) throw err;
//   console.table(rows);
//   db.close();
// });

// db.all("SELECT * FROM presensi;", [], (err, rows) => {
//   if (err) throw err;
//   console.table(rows); // tampilkan dalam format tabel di terminal
//   db.close();
// });

db.all("SELECT * FROM presensi;", [], (err, rows) => {
  if (err) throw err;

  // ubah field image_url jadi hanya nama file
  const formattedRows = rows.map(row => ({
    ...row,
    image_url: path.basename(row.image_url) // ambil nama file dari path
  }));

  console.table(formattedRows); // tampilkan hasilnya di terminal
  db.close();
});
