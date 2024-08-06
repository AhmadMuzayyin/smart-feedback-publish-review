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
        $sentiments = Http::post('http://localhost:3000/predict')->json();
        return view('sentimen.index', compact('sentiments'));
    }
}
