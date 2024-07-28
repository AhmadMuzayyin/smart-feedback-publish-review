<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Phpml\Classification\KNearestNeighbors;
use Phpml\Dataset\ArrayDataset;
use Phpml\FeatureExtraction\TokenCountVectorizer;
use Phpml\Tokenization\WhitespaceTokenizer;

class SentimenController extends Controller
{
    public function index()
    {
        $sentiments = $this->analyze();
        return view('sentimen.index', compact('sentiments'));
    }
    public function analyze()
    {
        $reviews = file_get_contents(storage_path('reviews.json'));
        $reviews = json_decode($reviews, true);

        $results = [];
        foreach ($reviews[0]['reviews'] as $review) {
            $response = Http::post('http://localhost:3000/predict', [
                'text' => $review['text'],
                'rating' => $review['rating']
            ]);

            $sentiment = $response->json();
            $results[] = [
                'review' => $review,
                'sentiment' => $sentiment
            ];
        }
        return $results;
    }
}
