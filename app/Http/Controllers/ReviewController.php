<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index()
    {
        $reviews = file_get_contents(storage_path('reviews.json'));
        $reviews = json_decode($reviews, true);
        return view('reviews.index', compact('reviews'));
    }
}
