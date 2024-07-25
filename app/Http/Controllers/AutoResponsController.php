<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AutoResponsController extends Controller
{
    public function index()
    {
        return view('autorespons.index');
    }
}
