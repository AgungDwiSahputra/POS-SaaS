<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>
        @hasSection('title')
            @yield('title') | {{ getAppName() }}
        @else
            {{ getAppName() }}
        @endif
    </title>
    <link rel="icon" type="image/png" href="{{ getAppFaviconUrl() }}">
    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.css"
        integrity="sha512-XtmMtDEcNz2j7ekrtHvOVR4iwwaD6o/FUJe6+Zq+HgcCsk3kj4uSQQR8weQ2QVj1hYGtG2ZIk3v9lmYQFqA29A=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick-theme.min.css"
        integrity="sha512-6lPL9i9GhlQQCm7u6k8Zcx2DEULFvt88NItVuoO9sm9Z1wGqlD6r6E1zCTnjfKkVN1J5x1Qvy7CkfwPwBXD9eA=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" href="{{ asset('assets/css/landing-page.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/css/style.css') }}" />
    {{-- <link href="{{ asset('assets/css/all.min.css') }}" rel="stylesheet" /> --}}

</head>

<body class="font-['Poppins'] antialiased">
    @include('web.layouts.header')
    @yield('content')
    @include('web.layouts.footer')
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"
        integrity="sha512-v2CJ7UaYy4JwqLDIrZUI/4hqeoQieOmAZNXBeQyjo21dadnwR+8ZaIJVT8EE2iyI61OV8e6M8PP2N4pqb+u1wA=="
        crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.js"
        integrity="sha512-XO3ZNmLeg40loW85r7Gq76YHbkTb+n0ifDYJV7PG+CifkVH9YKZJLfJXojkR/np5xpoe1ly0wk1T+qfLQC+fIw=="
        crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="{{ asset('assets/js/index.js') }}"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/alpinejs/3.13.8/cdn.min.js" defer
        integrity="sha512-x44Q5XAVczq3Xri7WtPs0F/otqlRK2VOG47hjQXdl4VX1A+02Z/vVOMUP6tQNrvl0Qeltqxp/ay/HmmpUT045g=="
        crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="{{ asset('assets/js/custom/custom.js') }}"></script>
</body>

</html>
