<!doctype html>
<html lang="{{ str_replace('_','-',app()->getLocale()) }}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    @vite(['resources/js/app.ts'])   {{-- change to app.js if that’s your entry --}}
    @inertiaHead
  </head>
  <body class="antialiased">
    @inertia
  </body>
</html>
