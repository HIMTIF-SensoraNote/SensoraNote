<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Like;
use App\Models\Notification;
use App\Models\Post;
use App\Models\Report;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PresentationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // 1. Truncate old data
        User::truncate();
        Post::truncate();
        Comment::truncate();
        Like::truncate();
        Report::truncate();
        Notification::truncate();

        // 2. Insert Users (Diverse photos)
        $admin = User::create([
            'name' => 'Admin Ba-Yu',
            'email' => 'admin@bayu.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'jenjang_pendidikan' => 'Universitas',
            'avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop', // Diverse face UI
            'bio' => 'Administrator resmi platform Ba-Yu.',
            'is_verified' => true,
        ]);

        $pakar1 = User::create([
            'name' => 'Dr. Ahmad Hidayat',
            'email' => 'ahmad@bayu.com',
            'password' => Hash::make('password'),
            'role' => 'pakar',
            'jenjang_pendidikan' => 'Universitas',
            'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', // Diverse face UI
            'bio' => 'Dosen Matematika dengan 19 tahun pengalaman mengajar',
            'is_verified' => true,
        ]);

        $pakar2 = User::create([
            'name' => 'Prof. Rina Susanti',
            'email' => 'rina@bayu.com',
            'password' => Hash::make('password'),
            'role' => 'pakar',
            'jenjang_pendidikan' => 'Universitas',
            'avatar' => 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop', // Diverse face UI
            'bio' => 'Pakar Fisika dan Kimia, hobi berbagi ilmu',
            'is_verified' => true,
        ]);

        $siswa1 = User::create([
            'name' => 'Siti Nurhaliza',
            'email' => 'siti@bayu.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'jenjang_pendidikan' => 'SMA',
            'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', // Diverse face UI
            'bio' => 'Suka berbagi catatan matematika',
            'is_verified' => false,
        ]);

        $siswa2 = User::create([
            'name' => 'Budi Santoso',
            'email' => 'budi@bayu.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'jenjang_pendidikan' => 'SMP',
            'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', // Diverse face UI
            'bio' => 'Pejuang nilai UTBK 🔥',
            'is_verified' => false,
        ]);

        $siswa3 = User::create([
            'name' => 'Dewi Lestari',
            'email' => 'dewi@bayu.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'jenjang_pendidikan' => 'SMA',
            'avatar' => 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', // Diverse face UI
            'bio' => 'Semangat belajar buat menggapai cita',
            'is_verified' => false,
        ]);

        // 3. Insert Posts
        $post1 = Post::create([
            'user_id' => $pakar1->id,
            'title' => 'Algoritma Sorting - Bubble Sort & Quick Sort',
            'content' => '<p><img src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=300&fit=crop" alt="Thumbnail" /></p><h1>Selamat Datang di Seri Algoritma Dasar 🚀</h1><p>Dalam ilmu komputer, <strong>Algoritma Sorting</strong> (pengurutan) adalah fondasi sentral yang harus dikuasai oleh setiap <em>software engineer</em>. Mari kita bedah dua algoritma unik yang paling sering ditanyakan saat interview: Bubble Sort dan Quick Sort.</p><br><h2>1. Bubble Sort (Pengurutan Gelembung)</h2><p>Bubble sort adalah algoritma pengurutan yang paling primitif. Alur kerjanya seperti gelembung air yang naik ke permukaan; elemen terbesar perlahan-lahan "mengapung" ke posisi paling kanan array.</p><blockquote><p><strong>⚠️ Warning:</strong> Jangan pernah menggunakan Bubble Sort untuk <em>production limit</em> karena kinerjanya sangat boros waktu untuk jumlah data yang besar.</p></blockquote><h3>Kompleksitas Waktu</h3><ul><li><strong>Worst Case: </strong> <span class="ql-formula" data-value="O(n^2)"></span> (Data terbalik)</li><li><strong>Best Case: </strong> <span class="ql-formula" data-value="O(n)"></span> (Data sudah terurut)</li></ul><br><h2>2. Quick Sort (Divide and Conquer)</h2><p>Ditemukan oleh <em>Tony Hoare</em> pada tahun 1959, algoritma ini membelah masalah besar menjadi masalah kecil-kecil yang lebih gampang diselesaikan.</p><h3>Mekanisme (Langkah Kerja)</h3><ol><li>Pilih satu elemen sebagai elemen <strong>Pivot</strong>.</li><li>Lakukan <em>Partitioning</em>:<ul><li>Pindahkan semua angka yang &lt; Pivot ke kiri</li><li>Pindahkan semua angka yang &gt; Pivot ke kanan</li></ul></li><li>Terapkan rekursi yang sama pada sub-array kiri dan kanan.</li></ol><br><p><img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80" alt="Code Background"></p><h3>Kesimpulan</h3><p>Memahami perbedaan <strong>Big-O Complexity</strong> adalah awal pertimbangan yang bijak saat menstrukturisasi aplikasi. Selamat <em>ngoding</em> teman-teman!</p>',
            'mapel' => 'algoritma',
            'jenjang' => 'SMA',
            'kelas' => '12',
            'semester' => '2',
            'thumbnail' => 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=300&fit=crop',
            'visibility' => 'public',
            'is_verified' => true,
            'likes_count' => 124,
            'comments_count' => 3,
            'views' => 2054,
        ]);

        $post2 = Post::create([
            'user_id' => $siswa1->id,
            'title' => 'Peta Konsep Sistem Pencernaan Manusia',
            'content' => '<h1>Sistem Pencernaan Manusia</h1><p>Sistem pencernaan terdiri dari mulut, kerongkongan, lambung, usus halus, usus besar, dan rektum. Setiap bagian memiliki fungsinya tersendiri...</p><blockquote><p>Pencernaan dimulai dari mulut dengan bantuan air liur (enzim ptialin).</p></blockquote><img src="https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400&h=300&fit=crop" /><p>Pastikan juga mengunyah makanan dengan baik ya teman-teman agar kerja lambung tidak terlalu berat!</p>',
            'mapel' => 'ipa',
            'jenjang' => 'SMP',
            'kelas' => '8',
            'semester' => '1',
            'thumbnail' => 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400&h=300&fit=crop',
            'visibility' => 'public',
            'is_verified' => true,
            'likes_count' => 56,
            'comments_count' => 1,
            'views' => 432,
        ]);

        $post3 = Post::create([
            'user_id' => $pakar2->id,
            'title' => 'Ringkasan Materi Redoks - Oksidasi Reduksi',
            'content' => '<p><img src="https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=400&h=300&fit=crop" alt="Thumbnail" /></p><h1>Reaksi Redoks</h1><p>Reaksi Reduksi-Oksidasi melibatkan perpindahan elektron antar zat.</p><h3>Konsep Penting</h3><ul><li><strong>Oksidasi:</strong> Pelepasan elektron, peningkatan bilangan oksidasi.</li><li><strong>Reduksi:</strong> Penangkapan elektron, penurunan bilangan oksidasi.</li></ul><p>Tonton video eksperimennya jika memungkinkan, kimia itu seru!</p>',
            'mapel' => 'kimia',
            'jenjang' => 'SMA',
            'kelas' => '10',
            'semester' => '2',
            'thumbnail' => 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=400&h=300&fit=crop',
            'visibility' => 'public',
            'is_verified' => true,
            'likes_count' => 210,
            'comments_count' => 0,
            'views' => 1024,
        ]);

        $post4 = Post::create([
            'user_id' => $siswa3->id,
            'title' => 'Tenses Bahasa Inggris - Simple Present',
            'content' => '<p><img src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=300&fit=crop" alt="Thumbnail" /></p><h1>Simple Present Tense</h1><p>Digunakan untuk menyatakan kejadian yang berlangsung rutin atau kebiasaan umum.</p><h3>Formula</h3><pre>Subject + Verb 1 (-s/es) + Object</pre><p>Contoh: <em>I go to school everyday.</em></p>',
            'mapel' => 'bahasa-inggris',
            'jenjang' => 'SMP',
            'kelas' => '7',
            'semester' => '1',
            'thumbnail' => 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=300&fit=crop',
            'visibility' => 'public',
            'is_verified' => false,
            'likes_count' => 34,
            'comments_count' => 0,
            'views' => 150,
        ]);

        $post5 = Post::create([
            'user_id' => $siswa2->id,
            'title' => 'Sistem Persamaan Linear Dua Variabel',
            'content' => '<p><img src="https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=400&h=300&fit=crop" alt="Thumbnail" /></p><h1>SPLDV</h1><p>Metode dasar untuk SPLDV adalah substitusi dan eliminasi.</p><p><span class="ql-formula" data-value="2x + y = 10"></span></p><ul><li>Metode grafik juga bisa digunakan tapi makan waktu.</li></ul>',
            'mapel' => 'matematika',
            'jenjang' => 'SMA',
            'kelas' => '10',
            'semester' => '2',
            'thumbnail' => 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=400&h=300&fit=crop',
            'visibility' => 'public',
            'is_verified' => false,
            'likes_count' => 12,
            'comments_count' => 0,
            'views' => 88,
        ]);

        $post6 = Post::create([
            'user_id' => $admin->id,
            'title' => 'Panduan Menulis Catatan Berkualitas Tinggi',
            'content' => '<p><img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop" alt="Thumbnail" /></p><h1>Selamat Datang di Ba-Yu Content Guide ✨</h1><p>Membuat catatan yang mudah dipahami berarti turut meringankan beban belajar teman yang lain. Berikut cara menulis yang baik:</p><h3>1. Gunakan Heading (Judul Besar)</h3><p>Pisahkan paragraf panjang menjadi poin-poin. Jangan membuat <em>wall of text</em>.</p><h3>2. Berikan Rumus yang Jelas</h3><p>Gunakan format <span class="ql-formula" data-value="E = mc^2"></span> dibanding sekadar "E=mc2".</p><blockquote>Banting tulanglah dalam belajar, jadilah penerang untuk sekitarmu!</blockquote>',
            'mapel' => 'bahasa-indonesia',
            'jenjang' => 'Umum',
            'kelas' => 'Semua Kelas',
            'semester' => '1',
            'thumbnail' => 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop',
            'visibility' => 'public',
            'is_verified' => true,
            'likes_count' => 540,
            'comments_count' => 0,
            'views' => 2000,
        ]);

        $post7 = Post::create([
            'user_id' => $pakar1->id,
            'title' => 'Dinamika Partikel (Hukum Newton I, II, III)',
            'content' => '<h1>Fisika Dinamika Partikel</h1><p>Isaac Newton memberikan 3 pondasi utama dalam memahami pergerakan benda di alam semesta.</p><h3>Hukum I Newton (Inersia)</h3><p>Benda yang diam akan tetap diam. Percepatan nol.</p><h3>Hukum II Newton</h3><p>Persamaan legendaris: <span class="ql-formula" data-value="\\Sigma F = m \\cdot a"></span>. Gaya adalah resultan dari massa dan percepatan.</p><h3>Hukum III Newton (Aksi = Reaksi)</h3><p>Setiap aksi akan selalu ada reaksi yang besarnya sama tapi berlawanan arah.</p><img src="https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400&h=300&fit=crop" />',
            'mapel' => 'fisika',
            'jenjang' => 'SMA',
            'kelas' => '10',
            'semester' => '2',
            'thumbnail' => 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400&h=300&fit=crop',
            'visibility' => 'public',
            'is_verified' => true,
            'likes_count' => 189,
            'comments_count' => 0,
            'views' => 970,
        ]);

        $post8 = Post::create([
            'user_id' => $siswa3->id,
            'title' => 'Sejarah Runtuhnya Tembok Berlin 1989',
            'content' => '<p><img src="https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&h=300&fit=crop" alt="Thumbnail" /></p><h1>Tembok Berlin</h1><p>Tembok Berlin (Antifaschistischer Schutzwall) merupakan simbol pemisahan fisik terkuat di era Perang Dingin, memisahkan Jerman Barat yang demokratis dengan Jerman Timur yang komunis.</p><p>Runtuh pada tanggal <strong>9 November 1989</strong> akibat gelombang protes besar-besaran dan kesalahan teknis pengunguman Politbiro Jerman Timur.</p><blockquote>Kejadian ini menjadi pintu gerbang bagi bersatunya pecahan negara Jerman.</blockquote>',
            'mapel' => 'sejarah',
            'jenjang' => 'SMA',
            'kelas' => '12',
            'semester' => '1',
            'thumbnail' => 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&h=300&fit=crop',
            'visibility' => 'public',
            'is_verified' => true,
            'likes_count' => 77,
            'comments_count' => 0,
            'views' => 210,
        ]);

        $post9 = Post::create([
            'user_id' => $siswa1->id,
            'title' => 'Pilar-Pilar Struktur Geografi Modern',
            'content' => '<p><img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=300&fit=crop" alt="Thumbnail" /></p><h1>Geografi dan Kehidupan</h1><p>Geografi tidak sekadar menghafal ibukota, tetapi memahami relasi timbal balik spasial. Terdapat 10 konsep esensial geografi:</p><ol><li>Lokasi</li><li>Jarak</li><li>Keterjangkauan</li><li>Pola</li><li>Morfologi...</li></ol><p>Pahami interaksinya dari perspektif keruangan dan kewilayahan.</p>',
            'mapel' => 'geografi',
            'jenjang' => 'SMA',
            'kelas' => '10',
            'semester' => '1',
            'thumbnail' => 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=300&fit=crop',
            'visibility' => 'public',
            'is_verified' => false,
            'likes_count' => 42,
            'comments_count' => 0,
            'views' => 110,
        ]);

        $post10 = Post::create([
            'user_id' => $pakar2->id,
            'title' => 'Struktur Sel Tumbuhan & Hewan',
            'content' => '<p><img src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=300&fit=crop" alt="Thumbnail" /></p><h1>Biologi Sel</h1><p>Kedua jenis sel ini punya banyak kesamaan seperti nukleus dan mitokondria, namun juga ada perbedaan radikal!</p><h3>Ciri Sel Tumbuhan:</h3><ul><li>Punya dinding sel (selulosa)</li><li>Kloroplas (fotosintesis)</li><li>Vakuola sangat besar</li></ul><h3>Ciri Sel Hewan:</h3><ul><li>Punya Lisosom & Sentrosom</li><li>Bentuk lebih fleksibel</li></ul>',
            'mapel' => 'biologi',
            'jenjang' => 'SMA',
            'kelas' => '11',
            'semester' => '1',
            'thumbnail' => 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=300&fit=crop',
            'visibility' => 'public',
            'is_verified' => true,
            'likes_count' => 310,
            'comments_count' => 0,
            'views' => 1400,
        ]);

        // 4. Insert Some Comments
        Comment::create([
            'post_id' => $post1->id,
            'user_id' => $siswa3->id,
            'content' => 'Wah penjelasannya lengkap banget dok, terima kasih banyak! Jadi paham bedanya Bubble dan Quick sort.',
        ]);

        Comment::create([
            'post_id' => $post1->id,
            'user_id' => $siswa2->id,
            'content' => 'Kalo pake Python lebih mudah dibaca ya ternyata.',
        ]);

        Comment::create([
            'post_id' => $post1->id,
            'user_id' => $admin->id,
            'content' => 'Mantap materi berkualitas tinggi 👍',
        ]);

        Comment::create([
            'post_id' => $post2->id,
            'user_id' => $siswa2->id,
            'content' => 'Gambar diagramnya sangat membantu.',
        ]);

        // 5. Insert Likes (Post 1)
        Like::create(['post_id' => $post1->id, 'user_id' => $siswa1->id]);
        Like::create(['post_id' => $post1->id, 'user_id' => $siswa2->id]);
        Like::create(['post_id' => $post1->id, 'user_id' => $siswa3->id]);
    }
}
