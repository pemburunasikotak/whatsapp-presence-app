const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Inisialisasi database SQLite
const db = new sqlite3.Database(path.join(__dirname, '../presensi.db'));

// Membuat tabel jika belum ada
db.run("CREATE TABLE IF NOT EXISTS presensi (id INTEGER PRIMARY KEY AUTOINCREMENT, student_name TEXT, student_nrp TEXT, message_text TEXT, image_url TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");

// Fungsi untuk menyimpan data presensi
function savePresensiData(studentName, studentNrp, messageText, imageUrl) {
    console.log('CEK DISINI', studentName, studentNrp, messageText, imageUrl)
    db.run(`INSERT INTO presensi (student_name, student_nrp, message_text, image_url) VALUES (?, ?, ?, ?)`, [studentName, studentNrp, messageText, imageUrl], (err) => {
        if (err) {
            console.error('Error saving data to database:', err);
        } else {
            console.log('Presensi berhasil disimpan!');
        }
    });
}

// Fungsi untuk mendapatkan data presensi
function getPresensiData(callback) {
    db.all("SELECT * FROM presensi ORDER BY timestamp DESC", [], (err, rows) => {
        if (err) {
            console.error('Error fetching presensi data:', err);
            callback(err, null);
        } else {
            callback(null, rows);
        }
    });
}
function deletePresensiData(id, callback) {
  db.run("DELETE FROM presensi WHERE id = ?", [id], function (err) {
    if (err) {
      console.error('Error deleting presensi data:', err);
      callback(err);
    } else {
      console.log(`Data dengan ID ${id} telah dihapus, ${this.changes} baris diubah`);
      callback(null);
    }
  });
}

module.exports = { savePresensiData, getPresensiData, deletePresensiData };
