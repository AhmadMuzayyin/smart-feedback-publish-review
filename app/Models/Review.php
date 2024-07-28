<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;
    protected $connection = 'mongodb';
    protected $collection = 'reviews';
    protected $table = 'reviews';
    protected $fillable = [
        'author_name',
        'author_url',
        'language',
        'profile_photo_url',
        'rating',
        'relative_time_description',
        'text'
    ];
}
