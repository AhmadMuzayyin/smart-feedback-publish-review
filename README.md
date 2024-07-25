# Smart Feedback

Aplikasi Smart Feedback adalah aplikasi yang digunakan untuk memberikan feedback secara otomatis kepada pengguna yang telah melakukan penilaian terhadap publish agency yang ada di Indonesia. Aplikasi ini dibuat menggunakan framework Laravel 11 dan menggunakan python untuk mengimplementasikan metode yang digunakan yaitu metode BERT.

## Requirements

- PHP >= 8.2
- Ctype PHP Extension
- cURL PHP Extension
- DOM PHP Extension
- Fileinfo PHP Extension
- Filter PHP Extension
- Hash PHP Extension
- Mbstring PHP Extension
- OpenSSL PHP Extension
- PCRE PHP Extension
- PDO PHP Extension
- Session PHP Extension
- Tokenizer PHP Extension
- XML PHP Extension

## Installation

- Clone the repo and `cd` into it
- Run `composer install`
- Rename or copy `.env.example` file to `.env`
- Run `php artisan key:generate`
- Set your database credentials in your `.env` file
- Run `php artisan migrate --seed` to create and seed your database
- Run `php artisan serve` to start the app

## License
