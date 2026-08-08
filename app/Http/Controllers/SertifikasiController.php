<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Sertifikasi;
use App\Models\User;
use Cloudinary\Cloudinary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SertifikasiController extends Controller
{
    public function ajukan(Request $request)
    {
        $request->validate([
            'bidang_keahlian' => 'required|string|max:255',
            'file_sertifikat' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $cekPengajuan = Sertifikasi::where('user_id', Auth::id())
            ->where('status', 'pending')
            ->first();

        if ($cekPengajuan) {
            return response()->json([
                'message' => 'Masih dicek admin der',
            ], 400);
        }

        $cloudinary = new Cloudinary(env('CLOUDINARY_URL'));
        $upload = $cloudinary->uploadApi()->upload($request->file('file_sertifikat')->getRealPath(), [
            'folder' => 'bayu_sertifikat',
            'resource_type' => 'auto',
        ]);

        $pathFile = $upload['secure_url'];

        $sertifikasi = Sertifikasi::create([
            'user_id' => Auth::id(),
            'bidang_keahlian' => $request->bidang_keahlian,
            'file_sertifikat' => $pathFile,
        ]);

        // Notif untuk admin
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'title' => 'Pengajuan Pakar Baru',
                'message' => Auth::user()->name.' mengajukan diri sebagai pakar di bidang '.$request->bidang_keahlian.'.',
                'type' => 'sertifikasi',
                'is_read' => false,
            ]);
        }

        return response()->json([
            'message' => 'Berkasi berhasil diajukan!.',
            'data' => $sertifikasi,
        ], 201);
    }

    // FUNGSI 1: Buat Admin ngeliat daftar antrean yang masih "pending"
    public function getPending()
    {
        // --- GEMBOK ADMIN ---
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Akses Ditolak kasian dah aowkaokawok'], 403);
        }
        // --------------------

        $pengajuan = Sertifikasi::orderBy('created_at', 'desc')->get();

        return response()->json([
            'message' => 'Berhasil mengambil daftar sertifikasi',
            'data' => $pengajuan,
        ], 200);
    }

    // FUNGSI 2: Buat Admin "Ketok Palu" (Terima/Tolak)
    public function verifikasi(Request $request, $id)
    {
        // --- GEMBOK ADMIN ---
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Cuma Admin yang bisa ketok palu der!'], 403);
        }
        // --------------------

        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $sertifikasi = Sertifikasi::find($id);

        if (! $sertifikasi) {
            return response()->json(['message' => 'Data pengajuan tidak ditemukan'], 404);
        }

        $sertifikasi->update([
            'status' => $request->status,
        ]);

        // 🔥 INI DIA OBATNYA: Kalau di-ACC, ubah jabatan usernya di tabel User!
        if ($request->status === 'approved') {
            $userPengaju = User::find($sertifikasi->user_id);
            if ($userPengaju) {
                $userPengaju->role = 'pakar';
                $userPengaju->save();
            }
        }

        $title = $request->status === 'approved' ? 'Sertifikasi Diterima!' : 'Sertifikasi Ditolak';

        $message = $request->status === 'approved'
            ? 'Selamat! Pengajuan sertifikasi pakarmu untuk bidang '.$sertifikasi->bidang_keahlian.' telah disetujui Admin.'
            : 'Mohon maaf, pengajuan sertifikasi pakarmu untuk bidang '.$sertifikasi->bidang_keahlian.' belum dapat disetujui saat ini.';

        Notification::create([
            'user_id' => $sertifikasi->user_id,
            'actor_id' => Auth::id(),
            'title' => $title,
            'message' => $message,
            'type' => 'sertifikasi',
            'is_read' => false,
        ]);

        return response()->json([
            'message' => 'Status berhasil diubah jadi '.$request->status.'!',
            'data' => $sertifikasi,
        ], 200);
    }
}
