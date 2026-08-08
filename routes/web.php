<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Post;
use App\Models\User;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect('/app');
    }
    
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/storage/sertifikat/{filename}', function ($filename) {
    // Strip any path component & enforce safe filename pattern
    $safeName = basename($filename);
    if ($safeName !== $filename || ! preg_match('/^[a-zA-Z0-9_\-\.]+$/', $safeName)) {
        return response('Nama file tidak valid', 400);
    }

    $candidates = [
        storage_path('app/sertifikat/'.$safeName),
        storage_path('app/public/sertifikat/'.$safeName),
    ];
    $allowedRoots = [
        realpath(storage_path('app/sertifikat')),
        realpath(storage_path('app/public/sertifikat')),
    ];

    foreach ($candidates as $i => $path) {
        if (! File::exists($path)) {
            continue;
        }
        $real = realpath($path);
        if ($real && $allowedRoots[$i] && str_starts_with($real, $allowedRoots[$i])) {
            return response()->file($real);
        }
    }

    return response('Waduh der, file fisiknya beneran kosong/nggak ada di VS Code lu! Coba upload ulang pengajuan baru.', 404);
})->where('filename', '[A-Za-z0-9_\-\.]+');

// Intercept specific routes for Open Graph Metadata
Route::get('/app/explore/note/{id}', function (Request $request, $id) {
    $meta = [
        'title' => 'Catatan di Ba-Yu',
        'description' => 'Baca catatan menarik ini di platform Ba-Yu.',
        'image' => asset('logo.svg'),
    ];

    try {
        $post = Post::find($id);
        if ($post) {
            $meta['title'] = $post->title . ' - Ba-Yu';
            $meta['description'] = $post->description ?? strip_tags(substr($post->plain_content ?? '', 0, 150)) . '...';
            if ($post->thumbnail) {
                $meta['image'] = $post->thumbnail;
            }
        }
    } catch (\Exception $e) {}

    return view('frontend', compact('meta'));
});

Route::get('/app/profile/{id}', function (Request $request, $id) {
    $meta = [
        'title' => 'Profil Pengguna - Ba-Yu',
        'description' => 'Lihat profil pengguna ini di Ba-Yu.',
        'image' => asset('logo.svg'),
    ];

    try {
        $user = User::find($id);
        if ($user) {
            $meta['title'] = $user->name . ' (@' . $user->username . ') - Ba-Yu';
            $meta['description'] = $user->bio ?? 'Bergabung dengan Ba-Yu dan bagikan catatan belajarmu!';
            if ($user->avatar) {
                $meta['image'] = $user->avatar;
            }
        }
    } catch (\Exception $e) {}

    return view('frontend', compact('meta'));
});

Route::get('/app/{any?}', function () {
    return view('frontend');
})->where('any', '.*');

require __DIR__.'/auth.php';
