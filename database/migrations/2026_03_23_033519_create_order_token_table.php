<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('order_token', function (Blueprint $table) {
            $table->increments('order_token_id');
            $table->unsignedInteger('session_token_id'); // Relasi ke session_token
            $table->string('token', 20)->unique();
            $table->unsignedInteger('total_price_estimate');
            $table->datetime('expired_at');
            $table->enum('status', ['active', 'redeemed', 'expired']);
            $table->timestamps();

            // Foreign Key ke tabel session_token
            $table->foreign('session_token_id')->references('token_id')->on('session_token')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_token');
    }
};
