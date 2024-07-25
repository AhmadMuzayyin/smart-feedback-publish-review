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
    return view('welcome');
});

Auth::routes();

Route::middleware(['auth'])->group(function () {
    Route::get('/home', 'HomeController@index')->name('home');

    Route::get('/profile', 'ProfileController@index')->name('profile');
    Route::put('/profile', 'ProfileController@update')->name('profile.update');

    Route::controller(ReviewController::class)->as('review.')->group(function () {
        Route::get('/reviews', 'index')->name('index');
        Route::get('/reviews/create', 'create')->name('create');
        Route::post('/reviews', 'store')->name('store');
        Route::get('/reviews/{review}', 'show')->name('show');
        Route::get('/reviews/{review}/edit', 'edit')->name('edit');
        Route::put('/reviews/{review}', 'update')->name('update');
        Route::delete('/reviews/{review}', 'destroy')->name('destroy');
    });
    Route::controller(SentimenController::class)->as('sentimen.')->group(function () {
        Route::get('/sentimen', 'index')->name('index');
        Route::get('/sentimen/create', 'create')->name('create');
        Route::post('/sentimen', 'store')->name('store');
        Route::get('/sentimen/{sentimen}', 'show')->name('show');
        Route::get('/sentimen/{sentimen}/edit', 'edit')->name('edit');
        Route::put('/sentimen/{sentimen}', 'update')->name('update');
        Route::delete('/sentimen/{sentimen}', 'destroy')->name('destroy');
    });
    Route::controller(AutoResponsController::class)->as('autorespons.')->group(function () {
        Route::get('/autorespons', 'index')->name('index');
        Route::get('/autorespons/create', 'create')->name('create');
        Route::post('/autorespons', 'store')->name('store');
        Route::get('/autorespons/{autorespons}', 'show')->name('show');
        Route::get('/autorespons/{autorespons}/edit', 'edit')->name('edit');
        Route::put('/autorespons/{autorespons}', 'update')->name('update');
        Route::delete('/autorespons/{autorespons}', 'destroy')->name('destroy');
    });
});
