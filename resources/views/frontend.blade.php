<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>{{ $meta['title'] ?? 'SensoraNote - Platform Catatan Inklusif' }}</title>
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    
    <!-- Open Graph / Share Metadata -->
    <meta property="og:title" content="{{ $meta['title'] ?? 'SensoraNote' }}">
    <meta property="og:description" content="{{ $meta['description'] ?? 'Platform catatan inklusif untuk semua.' }}">
    <meta property="og:image" content="{{ $meta['image'] ?? asset('favicon.svg') }}">
    <meta property="og:type" content="website">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $meta['title'] ?? 'SensoraNote' }}">
    <meta name="twitter:description" content="{{ $meta['description'] ?? 'Platform catatan inklusif untuk semua.' }}">
    <meta name="twitter:image" content="{{ $meta['image'] ?? asset('favicon.svg') }}">
    @viteReactRefresh
    @vite('resources/frontend/main.tsx')
</head>
<body class="bg-gray-50 dark:bg-[#13111C] text-slate-900 dark:text-slate-100 transition-colors duration-300 antialiased">
    <div id="root"></div>
    <!-- Sienna Accessibility Widget -->
    <script src="https://cdn.jsdelivr.net/npm/sienna-accessibility/dist/sienna-accessibility.umd.js" data-position="bottom-left" data-offset="25,80" async></script>
</body>
</html>
