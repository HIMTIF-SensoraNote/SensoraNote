<p align="center">
  <img src="./public/logo.svg" width="180" alt="Ba-Yu Logo">
</p>

<h1 align="center">Ba-Yu (Belajar Yuk) - Web & Mobile Platform</h1>

<p align="center">
  <strong>Platform Berbagi Catatan dan Ilmu Pengetahuan</strong><br>
  Proyek pembelajaran kolaboratif (PJBL) yang dibangun dengan arsitektur modern SPA, backend yang solid, dan aplikasi mobile native.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=capacitor&logoColor=white" alt="Capacitor">
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white" alt="Firebase">
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
</p>

---

## 🌟 Tentang Proyek

**Ba-Yu** adalah platform lintas perangkat (Web dan Android) untuk berbagi catatan pelajaran, berdiskusi, dan membagikan ilmu pengetahuan. Platform ini mempertemukan siswa reguler dengan para pakar tersertifikasi dalam sebuah komunitas yang suportif. 

Berawal dari prototipe web sederhana, kini Ba-Yu telah berkembang menjadi aplikasi skala produksi dengan arsitektur modern, didukung dengan i18n (lebih dari 40 bahasa), sistem verifikasi pengguna yang aman, dan dibungkus menjadi aplikasi Android (*Native Mobile App*).

## 🚀 Fitur Utama

- **SPA & Mobile Architecture**: Navigasi ultra-cepat menggunakan React Router yang diintegrasikan langsung di dalam Laravel lewat Vite, dan dibungkus menjadi APK Android menggunakan **Capacitor JS**.
- **Sistem Autentikasi & Otorisasi**: Login aman menggunakan Laravel Sanctum.
- **Native & Web OAuth (Google)**: Memudahkan pengguna masuk dan mendaftar dengan cepat hanya dengan satu klik menggunakan akun Google. Terintegrasi mulus menggunakan **Firebase Authentication** untuk pop-up *native* di Android, dan Socialite untuk versi Web.
- **Push Notifications (FCM)**: Dukungan notifikasi *real-time* dan *background* menggunakan **Firebase Cloud Messaging** untuk aplikasi Android.
- **Akses Media & Kamera Native**: Pengalaman unggah gambar yang terintegrasi dengan galeri dan kamera bawaan Android melalui *Permissions* WebView.
- **Cloudinary Integration**: Penyimpanan dan pengoptimalan *file* media gambar secara *cloud*.
- **Multibahasa (i18n)**: Dukungan terjemahan antarmuka ke lebih dari 40 bahasa.
- **Sertifikasi Pakar & Manajemen Catatan**: Sistem interaksi *social learning* komprehensif (like, bookmark, komentar).
- **Admin Dashboard**: Panel kontrol terpusat untuk memantau catatan, pengguna, laporan moderasi, hingga ekspor data komprehensif.
- **Manajemen Catatan**: Fitur untuk membuat, membaca, menyukai (like), menyimpan (bookmark), dan memberikan ulasan pada catatan pengguna lain.
- **Dark/Light Mode**: Dukungan antarmuka gelap dan terang secara *native*

## 🛠️ Tech Stack

### Backend
- **Framework**: Laravel v12.55.1 plugin v2.1.0
- **Database**: MongoDB & Cloudinary
- **API Security**: Laravel Sanctum

### Frontend
- **Library Utama**: React 19 + React Router v7
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **Build Tool**: Vite

### Mobile (Android)
- **Framework**: Capacitor JS
- **BaaS**: Firebase (Auth & FCM)
- **Permissions**: `CAMERA`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`

## 💻 Instalasi Lokal

Jika Anda ingin mengembangkan atau menjalankan aplikasi ini secara lokal, ikuti langkah-langkah berikut:

### Prasyarat
- PHP 8.3 atau lebih baru
- Composer
- Node.js (LTS version)
- MongoDB Database (Local atau Atlas)
- Android Studio (opsional, untuk *build* APK)

### Langkah Instalasi
1. **Clone repository ini**
   ```bash
   git clone https://github.com/Haitsam06/Ba-Yu.git
   cd Ba-Yu
   ```
2. **Install dependensi Backend (PHP)**
   ```bash
   composer install
   ```
3. **Install dependensi Frontend (NPM)**
   ```bash
   npm install
   ```
4. **Konfigurasi Environment**
   Salin file env dan atur koneksi MongoDB serta URL Ngrok/Hosting.
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
5. **Jalankan Aplikasi Web**
   Buka 2 terminal terpisah:
   ```bash
   php artisan serve
   npm run dev
   ```

## 📱 Build Aplikasi Android (Capacitor) & Panduan Lengkap Mobile

Aplikasi **Ba-Yu** telah dikonfigurasi secara lengkap menggunakan **Capacitor JS** untuk membungkus kode web (Laravel + React) menjadi aplikasi native Android (.APK) yang fungsional.

Berikut adalah penjelasan lengkap, cara kerja, alur integrasi fitur native, serta panduan pengujian proyek mobile ini agar mudah dipahami:

---

### 💡 Apa itu Capacitor JS & Bagaimana Cara Kerjanya?

**Capacitor JS** adalah *runtime* modern lintas platform buatan Ionic. Alat ini memungkinkan kita menggunakan teknologi web (HTML, CSS, JavaScript, React) untuk membuat aplikasi native di Android & iOS.

**Konsep Dasar (*The "Magic" of Capacitor*):**
Aplikasi mobile Ba-Yu pada dasarnya adalah aplikasi native Android biasa, tetapi isi tampilannya dijalankan di dalam sebuah browser bawaan sistem HP yang tersembunyi tanpa kolom alamat (disebut **`WebView`**). 

1. **Pembungkusan Kode Web ke APK:** Saat kita menjalankan perintah build, semua file React kita (HTML, JS, CSS) dikompilasi oleh Vite ke folder `public/build/` Laravel. Perintah sync Capacitor kemudian akan menyalin file-file statis ini ke folder aset proyek Android (`android/app/src/main/assets/public`).
2. **WebView Membaca File Lokal:** Ketika aplikasi dibuka di HP, WebView akan merender file `index.html` lokal tersebut seolah-olah sedang membuka website biasa, sehingga performanya sangat cepat.
3. **Bridge Native-ke-Web (Jembatan Komunikasi):** WebView biasa tidak bisa mengakses fitur HP (seperti kamera, galeri, notifikasi, dll). Di sinilah peran Capacitor sebagai **Bridge** (Jembatan). Dia menerjemahkan perintah JavaScript dari React menjadi kode native Java/Kotlin di Android.
4. **Eksekusi Fitur Native:** Ketika React memanggil fungsi login Google, Capacitor menangkap perintah itu melalui Bridge, memunculkan pop-up akun Google asli di Android, lalu mengembalikan token login-nya kembali ke React.

---

### 🔌 1. Pengujian Live Menggunakan Ngrok (Fase Development)

Karena saat pengembangan server backend kita berjalan di laptop (`localhost`), HP Android tidak bisa mengaksesnya secara langsung. Kita menggunakan **Ngrok** sebagai terowongan (tunnel) aman agar localhost laptop bisa diakses oleh HP dari mana saja secara online melalui HTTPS.

1. **Jalankan Server Laravel:**
   Jalankan server Laravel dengan flag `--host=0.0.0.0` agar bisa diakses dari jaringan luar:
   ```bash
   php artisan serve --host=0.0.0.0 --port=8001
   ```
2. **Jalankan Tunnel Ngrok:**
   ```bash
   ngrok http 8001
   ```
3. **Bypass Layar Peringatan Ngrok:**
   Ngrok gratisan memiliki layar peringatan awal saat diakses di HP. Kita mengatasinya dengan menyematkan `"appendUserAgent": "ngrok-bypass"` di file `capacitor.config.json` agar WebView otomatis melewati layar tersebut.

---

### 📂 2. Struktur Proyek & Inisialisasi

Untuk menjaga kerapian kode, proyek ini dipisahkan menjadi dua folder bertetangga:
*   **`Ba-Yu`**: Folder utama berisi repositori backend Laravel, database, dan frontend React.
*   **`Ba-Yu-Capacitor`**: Folder khusus berisi instalasi library Capacitor JS dan proyek native Android murni agar dependensi library mobile tidak bertabrakan dengan web.

**Konfigurasi Utama (`capacitor.config.json`):**
*   `appId`: **`com.bayu.mobile`** (ID unik aplikasi, harus sama persis dengan yang didaftarkan di Firebase Console).
*   `appName`: **`Ba-Yu`** (Nama aplikasi saat terinstall di HP).
*   `server.url`: Diarahkan ke URL Ngrok aktif (`https://...ngrok-free.dev`) agar WebView memuat perubahan kodingan kita secara *real-time/live* tanpa perlu install ulang APK setiap ada perubahan CSS/tampilan.

---

### 🔐 3. Integrasi Fitur Google Login Native (OAuth)

Login Google di HP menggunakan alur *native pop-up*, bukan pengalihan halaman browser biasa.

1. **Plugin Native:** Menggunakan library `@capacitor-firebase/authentication` untuk memanggil pilihan akun Google bawaan sistem Android.
2. **Konfigurasi Firebase:**
   - Aplikasi didaftarkan dengan ID `com.bayu.mobile` di Firebase Console.
   - File konfigurasi **`google-services.json`** diletakkan di folder `android/app/` (File ini **aman untuk di-push ke GitHub** karena hanya berisi konfigurasi ID Project publik).
   - Client ID Google didaftarkan di file `strings.xml` Android.
3. **Logika Jalur Ganda (Web vs Mobile):**
   Di file `Login.tsx`, kita mendeteksi lingkungan menggunakan `Capacitor.isNativePlatform()`:
   - **Jika Web:** Menggunakan alur OAuth Laravel Socialite standar (`window.location.href`).
   - **Jika Mobile:** Memanggil pop-up akun Google native, mendapatkan **ID Token**, lalu mengirimkan token tersebut melalui API (Axios) ke backend Laravel.
4. **Verifikasi Token di Backend:**
   Laravel menerima ID Token dari HP, menggunakan **Firebase Admin SDK** (`kreait/firebase-php`) untuk memverifikasi keaslian token ke server Google, mencari/membuat akun user di database MongoDB, dan melakukan login session aman.

---

### 🔔 4. Integrasi Push Notification (Firebase Cloud Messaging - FCM)

Aplikasi Ba-Yu mendukung pengiriman notifikasi instan langsung ke HP pengguna.

1. **Meminta Izin (Permissions):** Menggunakan plugin `@capacitor/push-notifications` untuk memunculkan kotak dialog izin notifikasi (wajib di Android 13+).
2. **Registrasi FCM Token:** Setelah izin diberikan, HP akan mendaftarkan diri ke server Firebase FCM. Server mengembalikan **FCM Token** unik (alamat tujuan pengiriman notifikasi ke HP tersebut).
3. **Penyimpanan di Database:** Di file `AuthenticatedLayout.tsx` (setelah user berhasil masuk), React mengirimkan FCM Token tersebut ke backend Laravel via API, lalu Laravel menyimpannya ke kolom `fcm_token` di tabel `users`.
4. **Pengiriman Notifikasi:** Admin/Laravel dapat mengirim pesan langsung ke target HP pengguna menggunakan token unik tersebut kapan saja.

---

### 🔄 5. Alur Kerja Rutin (Sinkronisasi & Build APK)

Setiap kali Kakak melakukan perubahan kodingan React/CSS di folder Laravel dan ingin melihat hasilnya di HP Android, ikuti alur kerja berikut:

1. **Kompilasi Ulang Kode Frontend React (di folder `Ba-Yu`):**
   ```bash
   npm run build
   ```
2. **Sinkronisasikan Perubahan ke Android (di folder `Ba-Yu-Capacitor`):**
   ```bash
   npx cap sync android
   ```
   *(Perintah ini akan menyalin file web terbaru dan memperbarui plugin mobile).*
3. **Jalankan & Tanam Langsung ke HP (HP tercolok kabel data):**
   ```bash
   npx cap run android
   ```
   *(Atau jalankan `npx cap build android` untuk meng-compile file APK baru yang bisa disebarkan).*

*Catatan: Karena kita menggunakan live-reload via Ngrok, setelah Kakak menjalankan `npm run build` di laptop, Kakak cukup **menutup paksa aplikasi (swipe close)** di HP lalu membukanya kembali untuk langsung melihat hasil editan terbarunya secara otomatis tanpa perlu colok kabel data lagi!* 🚀

## 🐳 Deployment (Production)

Proyek ini sudah dilengkapi dengan `Dockerfile` tingkat *production* berbasis Apache. Untuk mem-*build* dan menjalankannya:

```bash
docker build -t bayu-web .
docker run -p 8000:8000 bayu-web
```

## 📝 Lisensi

Hak cipta dilindungi. Proyek ini dibangun sebagai tugas PJBL dan hak miliknya berada pada kontributor utama repositori ini.
