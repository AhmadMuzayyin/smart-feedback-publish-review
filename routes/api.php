<?php

use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});
Route::get('/reviews', function () {
    $client = new Client();
    $url = 'http://localhost:5000/save_reviews';
    $data = json_decode(file_get_contents(storage_path('reviews.json')), true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        return response()->json(['error' => 'Invalid JSON format'], 400);
    }
    try {
        $response = $client->post($url, [
            'json' => $data,
        ]);

        $responseData = json_decode($response->getBody(), true);

        return response()->json($responseData);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});
