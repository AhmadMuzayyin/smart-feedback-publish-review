<?php

use App\Http\Controllers\AutoResponsController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\SentimenController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return to_route('login');
});

Auth::routes();

Route::middleware(['auth'])->group(function () {
    Route::get('/home', 'HomeController@index')->name('home');

    Route::get('/profile', 'ProfileController@index')->name('profile');
    Route::put('/profile', 'ProfileController@update')->name('profile.update');

    Route::controller(ReviewController::class)->as('review.')->group(function () {
        Route::get('/reviews', 'index')->name('index');
    });
    Route::controller(SentimenController::class)->as('sentimen.')->group(function () {
        Route::get('/sentimen', 'index')->name('index');
    });
    Route::controller(AutoResponsController::class)->as('autorespons.')->group(function () {
        Route::get('/autorespons', 'index')->name('index');
    });
});
