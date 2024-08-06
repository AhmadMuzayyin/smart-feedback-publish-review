<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AutoResponsController extends Controller
{
    public function index()
    {
        $autoresponse = Http::post('http://localhost:3000/predict')->json();
        return view('autorespons.index', compact('autoresponse'));
    }
}
