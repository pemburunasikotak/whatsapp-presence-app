// const { Client, LocalAuth } = require("whatsapp-web.js");
// const qrcode = require("qrcode-terminal");
// const fs = require("fs");
// const path = require("path");
// const { savePresensiData } = require("../config/db"); // Fungsi untuk menyimpan data ke DB
// const cron = require("node-cron");

// // Inisialisasi WhatsApp Client
// const client = new Client({
//   authStrategy: new LocalAuth(), // Menyimpan sesi agar tidak perlu login ulang
// });

// // Menampilkan QR Code di terminal untuk login
// client.on("qr", (qr) => {
//   qrcode.generate(qr, { small: true });
// });

// // Setelah client siap
// client.on("ready", () => {
//   console.log("Client is ready!");
// });

// // Mengambil pesan dan gambar
// client.on("ready", () => {
//   console.log("Client is ready!");

//   // Mendapatkan daftar grup dan mencari grup "KELAS_1"
//   client.getChats().then((chats) => {
//     // Filter hanya grup
//     const groups = chats.filter((chat) => chat.isGroup);

//     // Mencari grup dengan nama "KELAS_1"
//     const targetGroup = groups.find((group) => group.name === "KELAS_1");

//     if (targetGroup) {
//       console.log(
//         `Grup ditemukan: ${targetGroup.name}, ID Grup: ${targetGroup.id._serialized}`
//       );

//       // Menangani pesan yang datang ke grup "KELAS_1"
//       client.on("message", async (message) => {
//         // Memeriksa apakah pesan berasal dari grup yang tepat
//         // console.log("CEK LOG", message);
//         const senderPhoneNumber = message.from.split("@")[0];
//         console.log("SENDER", senderPhoneNumber);
//         if (message.from === targetGroup.id._serialized) {
//           console.log(
//             `Pesan diterima di grup ${targetGroup.name}: ${message.body}`
//           );

//           // Menangani pesan gambar atau file
//           const senderId = message.from.split("@")[0];
//           const contact = await client.getContactById(senderId);
//           const senderPhoneNumber = contact.number; // Nomor telepon pengirim

//           console.log(`Nomor Telepon Pengirim: ${senderPhoneNumber}`);

//           const regex = /^(\d+)\s(.+)$/;
//           const match = message.body.match(regex);
//           console.log("MATCH", match, match[2]);
//           console.log("MATCH2", message.body, targetGroup.name);

//           let filePath = null;
//           if (message.hasMedia) {
//             const media = await message.downloadMedia();
//             filePath = path.join(
//               __dirname,
//               "../data/images",
//               `${match[1]}_${match[2]}.jpg`
//             );

//             // Menyimpan gambar ke folder 'data/images'
//             fs.writeFileSync(filePath, media.data, "base64");
//             console.log(`Gambar disimpan di: ${filePath}`);
//           }

//           // Menyimpan data presensi (termasuk teks dan gambar)
//           savePresensiData(message.from, message.body, filePath);
//         }
//       });
//     } else {
//       console.log('Grup "KELAS_1" tidak ditemukan.');
//     }
//   });
// });

// // Reset data setiap hari pada pukul 00:00
// cron.schedule("0 0 * * *", () => {
//   console.log("Resetting presensi data...");

//   db.run("DELETE FROM presensi", (err) => {
//     if (err) {
//       console.error("Error resetting database:", err);
//     } else {
//       console.log("Data presensi berhasil direset.");
//     }
//   });
// });

// // Mulai client
// client.initialize();


const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const path = require("path");
const { savePresensiData } = require("../config/db");
const cron = require("node-cron");

// Inisialisasi WhatsApp Client
const client = new Client({
  authStrategy: new LocalAuth(), // Menyimpan sesi agar tidak perlu login ulang
});

// Menampilkan QR Code di terminal untuk login
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

// Setelah client siap
client.on("ready", () => {
  console.log("Client is ready!");
});

// Mengambil pesan dan gambar
client.on("message", async (message) => {
   client.getChats().then(async (chats) => {
    
    // Filter hanya grup
    const groups = chats.filter((chat) => chat.isGroup);

    // Mencari grup dengan nama "KELAS_1"
    const targetGroup = groups.find((group) => group.name === "KELAS_1");

    if (targetGroup) {
      console.log(
        `Grup ditemukan: ${targetGroup.name}, ID Grup: ${targetGroup.id._serialized}`
      );
        if (message.from === targetGroup.id._serialized) {
          console.log(
            `Pesan diterima di grup ${targetGroup.name}: ${message.body}`
          );

          const words = message.body.split(" ");
          const name = words.slice(1).join(" ")
          const nrp = words[0]
          let filePath = null;
          if (message.hasMedia) {
            const media = await message.downloadMedia();
            filePath = path.join(
              __dirname,
              "../data/images",
              `${nrp}_${name}.jpg`
            );

            // Menyimpan gambar ke folder 'data/images'
            fs.writeFileSync(filePath, media.data, "base64");
            console.log(`Gambar disimpan di: ${filePath}`);
          }
          savePresensiData(name, nrp, message.body, filePath);
        }
      // });
    } else {
      console.log('Grup "KELAS_1" tidak ditemukan.');
    }

   });

  // if (message.isGroupMsg && message.body) {
  //   const regex = /^(\d{10})\s(.+)$/; // Format: NRP [spasi] Nama
  //   const match = message.body.match(regex);

  //   console.log("Received message:", message.body);

  //   if (match) {
  //     const studentNrp = match[1];
  //     const studentName = match[2];

  //     console.log(`Nama: ${studentName}, NRP: ${studentNrp}`);

  //     let imageUrl = null;
  //     if (message.hasMedia) {
  //       const media = await message.downloadMedia();
  //       const imageFileName = `${studentNrp}_${studentName}.jpg`;
  //       const filePath = path.join(__dirname, "../data/images", imageFileName);

  //       // Menyimpan gambar ke folder 'data/images'
  //       fs.writeFileSync(filePath, media.data, "base64");
  //       imageUrl = `/images/${imageFileName}`; // URL gambar

  //       console.log(`Gambar disimpan di: ${filePath}`);
  //     }

  //     // Menyimpan data presensi ke database
  //     savePresensiData(studentName, studentNrp, message.body, imageUrl);
  //   } else {
  //     console.log("Format pesan tidak sesuai.");
  //   }
  // }
});

// Reset data setiap hari pada pukul 00:00
cron.schedule("0 0 * * *", () => {
  console.log("Resetting presensi data...");
  db.run("DELETE FROM presensi", (err) => {
    if (err) {
      console.error("Error resetting database:", err);
    } else {
      console.log("Data presensi berhasil direset.");
    }
  });
});

// Mulai client
client.initialize();
