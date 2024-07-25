<?php

use App\Models\Review;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sentiment_analys', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Review::class)->constrained()->cascadeOnDelete();
            $table->string('sentimentCategory');
            $table->decimal('sentimentScore', 20, 15);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sentiment_analys');
    }
};
