# Website Pondok Pesantren Hidayatul Ma'mun Pedang Songo

Starter project website profil + dashboard database santri. Dibuat dengan HTML, CSS, JavaScript, Supabase, dan dapat di-host di GitHub Pages.

## Isi proyek
- `index.html` — halaman profil publik.
- `admin/login.html` — login administrator.
- `admin/index.html` — dashboard database santri.
- `css/style.css` — desain responsif.
- `js/` — konfigurasi dan logika aplikasi.
- `supabase/schema.sql` — struktur database dan aturan keamanan (RLS).
- `assets/` — aset placeholder yang dapat diganti logo/foto asli.

## A. Siapkan database Supabase
1. Buat project baru di https://supabase.com/.
2. Buka SQL Editor.
3. Salin dan jalankan isi `supabase/schema.sql`.
4. Buka Authentication > Providers, pastikan Email aktif.
5. Buka Authentication > Users, buat user admin secara manual. Jangan aktifkan pendaftaran publik.
6. Salin User UID admin tersebut.
7. Di SQL Editor jalankan perintah berikut dengan UUID asli:
   ```sql
   insert into public.profiles (id, role)
   values ('UUID-USER-ADMIN', 'admin');
   ```
8. Buka Project Settings > API. Salin Project URL dan anon/publishable key.
9. Isi `js/config.js`:
   - `SUPABASE_URL` dengan Project URL.
   - `SUPABASE_ANON_KEY` dengan anon/publishable key.
10. Jangan pernah menaruh `service_role` / secret key di file frontend, GitHub, atau website.

## B. Jalankan di komputer
Untuk percobaan sederhana, buka `index.html` melalui Live Server (misalnya ekstensi VS Code). Login dan database memerlukan koneksi internet serta konfigurasi Supabase yang benar.

## C. Publikasikan gratis di GitHub Pages
1. Buat repository GitHub baru.
2. Upload seluruh isi folder proyek ke root repository.
3. Buka Settings > Pages.
4. Pada Build and deployment pilih Deploy from a branch.
5. Pilih branch `main`, folder `/ (root)`, lalu Save.
6. Tunggu proses deployment. Alamat gratis biasanya berbentuk `https://USERNAME.github.io/NAMA-REPOSITORY/`.

GitHub Pages menyediakan hosting statis dan subdomain `github.io`. Domain sendiri seperti `.com` biasanya perlu dibeli. Paket gratis layanan database memiliki batas pemakaian dan ketentuan yang dapat berubah.

## D. Mengganti identitas pondok
- Ganti `assets/logo-placeholder.svg` dengan logo resmi (sesuaikan referensi di HTML bila nama file berubah).
- Ganti foto latar `assets/hero-placeholder.svg` dengan foto gerbang/lingkungan pondok.
- Edit teks placeholder di `index.html`: sejarah, visi-misi, program, alamat, kontak, dan sambutan.
- Sesuaikan warna di bagian `:root` pada `css/style.css`.

## Keamanan dan privasi
- Dashboard admin tidak menyediakan pendaftaran akun publik.
- Semua tabel database santri menggunakan Row Level Security (RLS).
- Hanya user yang memiliki baris `profiles` dengan role `admin` yang dapat mengelola data santri.
- Jangan pernah memasukkan data santri sungguhan sebelum pengaturan akses, akun admin, dan kebijakan privasi diperiksa.
- Batasi akses akun admin, gunakan kata sandi unik dan kuat, aktifkan MFA bila tersedia, dan lakukan backup data secara berkala.
- Ekspor CSV berisi data pribadi; simpan secara aman dan jangan membagikannya sembarangan.
- Starter ini belum mencakup pengelolaan berita/galeri dari dashboard, reset password, audit log, atau multi-role.

## Catatan
Ini adalah starter mentah untuk dikembangkan lebih lanjut di Antigravity. Pastikan pengujian RLS dilakukan dengan akun admin dan sesi anonim sebelum memasukkan data asli. Jangan menganggap UI login saja sebagai keamanan; keamanan utama harus tetap di database Supabase.
