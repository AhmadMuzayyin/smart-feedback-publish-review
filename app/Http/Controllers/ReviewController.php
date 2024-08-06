<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ReviewController extends Controller
{
    public function index()
    {
        $reviews = Http::get('http://localhost:3000/reviews')->json();
        return view('reviews.index', compact('reviews'));
    }
    public function classify()
    {
        $reviews = file_get_contents(storage_path('reviews.json'));
        $reviews = json_decode($reviews, true);

        $results = [];
        foreach ($reviews as $review) {
            $response = Http::post('http://localhost:5000/classify', [
                'text' => $review['text'],
                'rating' => $review['rating']
            ]);

            $sentiment = $response->json();
            $results[] = [
                'review' => $review,
                'classify' => $sentiment
            ];
        }
        return $results;
    }
}
