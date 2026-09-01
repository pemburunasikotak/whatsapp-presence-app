const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const path = require("path");
const { savePresensiData, resetPresensiData } = require("../config/db");
const cron = require("node-cron");
const Jimp = require("jimp-compact");

// Inisialisasi WhatsApp Client
const client = new Client({
  authStrategy: new LocalAuth(), // simpan sesi login
});

// QR Code untuk login
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

// Saat client siap
client.on("ready", () => {
  console.log("✅ WhatsApp Client is ready!");
});

// Fungsi untuk buat random ID
function generateRandomId() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 20; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Event message listener
// client.on("message", async (message) => {
//   try {
//     const chats = await client.getChats();
//     const groups = chats.filter((chat) => chat.isGroup);

//     const targetGroups = [
//       "TIK D4 TES",
//       "TIK TES 2",
//       "TIK K31A",
//       "TIK K3",
//       "K3IB TIK",
//       "TIK K31D",
//       "TIK DCIB",
//       "TIK - DCIA",
//       "TIK DCID",
//       "K31F TIK",
//       "TIK - DC1A",
//       "TIK K325-E"
//     ];
//     const matchedGroups = groups.filter((group) =>
//       targetGroups.includes(group.name)
//     );

//     if (matchedGroups.length === 0) {
//       console.log("❌ Tidak ada grup target ditemukan.");
//       return;
//     }

//     const groupMatch = matchedGroups.find(
//       (group) => group.id._serialized === message.from
//     );
//     if (!groupMatch) return;
//     const words = message.body.trim().split(" ");
//     if (words.length < 2) {
//       console.log("⚠️ Format pesan salah. Gunakan: <NRP> <NAMA>");
//       return;
//     }
//     const nrp = words[0];
//     const name = words.slice(1).join(" ");
//     let filePath = null;
//     const contactUser = await message.getContact();
//     if (message.hasMedia) {
//       const media = await message.downloadMedia();
//       filePath = path.join(__dirname, "../data/images", `${nrp}_${name}.jpg`);
//       fs.writeFileSync(filePath, media.data, "base64");
//       const image = await Jimp.read(filePath);
//       const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
//       const now = new Date().toLocaleString("id-ID");

//       image.print(font, 20, 20, `Nama    : ${name}`);
//       image.print(font, 20, 50, `NRP     : ${nrp}`);
//       image.print(font, 20, 80, `Tanggal : ${now}`);

//       const logoPath = path.join(__dirname, "../asset/logoppns.png");
//       const logo = await Jimp.read(logoPath);
//       logo.resize(100, Jimp.AUTO);
//       const x = image.bitmap.width - logo.bitmap.width - 20;
//       const y = 20;
//       image.composite(logo, x, y, {
//         mode: Jimp.BLEND_SOURCE_OVER,
//         opacitySource: 1,
//         opacityDest: 1,
//       });

//       await image.writeAsync(filePath);

//       await savePresensiData(
//         name,
//         nrp,
//         message.body,
//         filePath,
//         groupMatch.name,
//         contactUser.id._serialized
//       );

//       const mediaMsg = MessageMedia.fromFilePath(filePath);
//       await client.sendMessage(contactUser.id._serialized, mediaMsg, {
//         caption: `✅ Presensi berhasil! 🎉 Terima kasih kak ${name} (NRP: ${nrp}) sudah melakukan presensi. Semangat terus belajar 💪📚\n\nRandom ID: ${generateRandomId()}`,
//       });
//     }
//   } catch (err) {
//     console.error("❌ Error saat memproses pesan:", err);
//   }
// });
client.on("message", async (message) => {
  try {
    const chats = await client.getChats();
    const groups = chats.filter((chat) => chat.isGroup);

    const targetGroups = [
      "TIK D4 TES",
      "TIK TES 2",
      "TIK K31A",
      "TIK K3",
      "K3IB TIK",
      "TIK K31D",
      "TIK DCIB",
      "TIK - DCIA",
      "TIK DCID",
      "K31F TIK",
      "TIK - DC1A",
      "TIK K325-E",
    ];
    const matchedGroups = groups.filter((group) =>
      targetGroups.includes(group.name)
    );

    if (matchedGroups.length === 0) {
      console.log("❌ Tidak ada grup target ditemukan.");
      return;
    }

    const groupMatch = matchedGroups.find(
      (group) => group.id._serialized === message.from
    );
    if (!groupMatch) return;
    const words = message.body.trim().split(" ");
    if (words.length < 2) {
      console.log("⚠️ Format pesan salah. Gunakan: <NRP> <NAMA>");
      return;
    }
    const nrp = words[0];
    const name = words.slice(1).join(" ");
    let filePath = null;
    // Hapus baris ini untuk menghindari error getContact
    // const contactUser = await message.getContact();
    // const contact = await message.getContact();
    // const senderId = await message.getMentions();
    //  let user = await msg.getContact();
    // const senderNumber = senderId.split('@')[0];
    // console.log("Pesan dari:", senderId);
    // for (let user of mentions) {
    //   console.log(`${user.pushname} was mentioned`);
    // }

    const chat = await message.getChat();
    // let user = await message.getContact();
    console.log("Pesan dari:", chat);
    // console.log("Pesan dari:", chat);

    if (message.hasMedia) {
      const media = await message.downloadMedia();
      filePath = path.join(__dirname, "../data/images", `${nrp}_${name}.jpg`);
      fs.writeFileSync(filePath, media.data, "base64");
      const image = await Jimp.read(filePath);
      const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
      const now = new Date().toLocaleString("id-ID");

      image.print(font, 20, 20, `Nama    : ${name}`);
      image.print(font, 20, 50, `NRP     : ${nrp}`);
      image.print(font, 20, 80, `Tanggal : ${now}`);

      const logoPath = path.join(__dirname, "../asset/logoppns.png");
      const logo = await Jimp.read(logoPath);
      logo.resize(100, Jimp.AUTO);
      const x = image.bitmap.width - logo.bitmap.width - 20;
      const y = 20;
      image.composite(logo, x, y, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 1,
        opacityDest: 1,
      });

      await image.writeAsync(filePath);

      await savePresensiData(
        name,
        nrp,
        message.body,
        filePath,
        groupMatch.name,
        message.author
      );

      console.log("✅ Presensi data berhasil disimpan untuk", message);

      const mediaMsg = MessageMedia.fromFilePath(filePath);
      await client.sendMessage(message.author, mediaMsg, {
        caption: `✅ Presensi berhasil! 🎉 Terima kasih kak ${name} (NRP: ${nrp}) sudah melakukan presensi. Semangat terus belajar 💪📚\n\nRandom ID: ${generateRandomId()}`,
      });
    }
  } catch (err) {
    await client.sendMessage(message.author, mediaMsg, {
      caption: `✅ YANG BENER LAH NGISINYA \n\nRandom ID: ${generateRandomId()}`,
    });
    console.error("❌ Error saat memproses pesan:", err);
  }
});

// Cron job reset data setiap hari jam 00:00
cron.schedule("0 0 * * *", async () => {
  console.log("⏳ Resetting presensi data...");
  try {
    await resetPresensiData();
    console.log("✅ Data presensi berhasil direset.");
  } catch (err) {
    console.error("❌ Gagal reset database:", err);
  }
});

// Mulai client
client.initialize();
