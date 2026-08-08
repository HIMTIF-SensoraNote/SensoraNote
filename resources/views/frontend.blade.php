<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <title>{{ $meta['title'] ?? 'Best Learning - Social Media' }}</title>
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/logo.svg">
    
    <!-- Open Graph / Share Metadata -->
    <meta property="og:title" content="{{ $meta['title'] ?? 'Best Learning - Social Media' }}">
    <meta property="og:description" content="{{ $meta['description'] ?? 'Platform belajar dan berbagi catatan terbaik.' }}">
    <meta property="og:image" content="{{ $meta['image'] ?? asset('logo.svg') }}">
    <meta property="og:type" content="website">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $meta['title'] ?? 'Best Learning - Social Media' }}">
    <meta name="twitter:description" content="{{ $meta['description'] ?? 'Platform belajar dan berbagi catatan terbaik.' }}">
    <meta name="twitter:image" content="{{ $meta['image'] ?? asset('logo.svg') }}">
    @viteReactRefresh
    @vite('resources/frontend/main.tsx')
</head>
<body class="bg-gray-50 dark:bg-[#13111C] text-slate-900 dark:text-slate-100 transition-colors duration-300 antialiased">
    <div id="root"></div>
</body>
</html>
