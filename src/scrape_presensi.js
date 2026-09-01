// scrape_presensi.js
require('dotenv').config();
const { chromium } = require('playwright');

async function run(attendanceRecords = []) {
  const USERNAME = process.env.SIM_USERNAME;
  const PASSWORD = process.env.SIM_PASSWORD;
  const HEADLESS = (process.env.HEADLESS ?? 'true') === 'true';

  if (!USERNAME || !PASSWORD) {
    throw new Error('Missing SIM_USERNAME or SIM_PASSWORD in environment.');
  }

  const browser = await chromium.launch({ headless: HEADLESS });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Buka login page
    await page.goto('https://sim.ppns.ac.id/index.php/auth/index', { waitUntil: 'domcontentloaded', timeout: 60000 });

    // 2. Isi login — **Selector mungkin perlu disesuaikan**:
    // Coba beberapa nama input umum. Jika tidak cocok, gunakan Playwright inspector untuk cari selector yang benar.
    const usernameSelector = 'input[name="username"], input#username, input[type="text"]';
    const passwordSelector = 'input[name="password"], input#password, input[type="password"]';
    const loginButtonSelector = '#but_login';

    await page.waitForTimeout(500); // short pause
    await page.fill(usernameSelector, USERNAME);
    await page.fill(passwordSelector, PASSWORD);
    await Promise.all([
      page.click(loginButtonSelector),
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(()=>{}),
    ]);

    // 3. Pastikan login sukses
    // Cek adanya elemen yang hanya muncul setelah login (contoh: teks "Dashboard" atau link logout)
    const loggedIn = await page.locator('text=Dashboard').first().count() > 0
      || await page.locator('a:has-text("Logout"), a:has-text("Keluar")').count() > 0;

    if (!loggedIn) {
      console.warn('Login mungkin gagal — halaman mungkin meminta verifikasi atau selector perlu disesuaikan.');
      // masih lanjut mencoba: jika ada redirect ke dashboard/landing tertentu, kamu bisa set URL langsung
    }

    // 4. Navigasi ke menu Administrasi
    // Cara fleksibel: klik menu yang berisi kata 'Administrasi' atau buka URL bila diketahui
    const adminLink = await page.locator('a:has-text("Administrasi"), a:has-text("Administrasi Kegiatan"), nav >> text=Administrasi').first();
    if (await adminLink.count() > 0) {
      await adminLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      // Jika tidak ketemu, coba direct URL (sesuaikan jika kamu tahu pathnya)
      // await page.goto('https://sim.ppns.ac.id/index.php/administrasi', { waitUntil: 'networkidle' });
      console.warn('Link "Administrasi" tidak ditemukan otomatis — periksa struktur menu, atau sesuaikan URL di script.');
    }

    // 5. Buka form entri kehadiran
    // Kita asumsikan ada tombol/link 'Entri Kehadiran' atau 'Presensi'
    const presensiLink = await page.locator('a:has-text("Entri Kehadiran"), a:has-text("Presensi"), button:has-text("Entri Kehadiran")').first();
    if (await presensiLink.count() > 0) {
      await presensiLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      console.warn('Link/btn entri kehadiran tidak ditemukan otomatis — sesuaikan selector.');
    }

    // 6. Entri data kehadiran — attendanceRecords adalah array object:
    // [{nrp: '12345', nama: 'Budi', status: 'Hadir', keterangan: ''}, ...]
    for (const rec of attendanceRecords) {
      // contoh: cari field input NRP / nama / status
      // **Sesuaikan selector sesuai form sebenarnya**
      const nrpSel = 'input[name="nrp"], input[id*="nrp"]';
      const namaSel = 'input[name="nama"], input[id*="nama"]';
      const statusSel = 'select[name="status"], select[id*="status"]';
      const keteranganSel = 'textarea[name="keterangan"], textarea[id*="keterangan"]';
      const submitSel = 'button:has-text("Simpan"), button:has-text("Submit"), input[type="submit"]';

      // Tunggu form muncul
      await page.waitForSelector(nrpSel, { timeout: 5000 }).catch(()=>{});
      // Isi (cek keberadaan tiap field dahulu)
      if (await page.locator(nrpSel).count()) await page.fill(nrpSel, String(rec.nrp || ''));
      if (await page.locator(namaSel).count()) await page.fill(namaSel, rec.nama || '');
      if (await page.locator(statusSel).count()) await page.selectOption(statusSel, { label: rec.status || 'Hadir' }).catch(()=>{});
      if (await page.locator(keteranganSel).count()) await page.fill(keteranganSel, rec.keterangan || '');

      // Submit
      if (await page.locator(submitSel).count()) {
        await Promise.all([
          page.click(submitSel),
          page.waitForLoadState('networkidle').catch(()=>{}),
        ]);
      } else {
        console.warn('Tombol submit tidak ditemukan — kamu perlu menyesuaikan selector submitSel.');
      }

      // Optional: cek notifikasi sukses
      const success = await page.locator('text=Berhasil, text=Sukses, text=Data berhasil').count() > 0;
      console.log(`Entri untuk NRP ${rec.nrp} diproses. sukses? ${success}`);
      await page.waitForTimeout(500); // jeda kecil antar entri
    }

    console.log('Selesai entri kehadiran.');
  } catch (err) {
    console.error('Error saat scraping/automation:', err);
  } finally {
    await browser.close();
  }
}

// Jika dipanggil langsung: contoh data (ganti/isi dinamis jika dipanggil dari WA)
if (require.main === module) {
  const sample = [
    { nrp: '190001', nama: 'Andi', status: 'Hadir', keterangan: '' },
    { nrp: '190002', nama: 'Budi', status: 'Izin', keterangan: 'Sakit' },
  ];
  run(sample).catch(e => { console.error(e); process.exit(1); });
}

module.exports = { run };
