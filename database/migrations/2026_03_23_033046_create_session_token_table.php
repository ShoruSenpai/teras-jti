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
        Schema::create('session_token', function (Blueprint $table) {
            $table->increments('token_id'); //
            $table->string('token', 255)->unique(); //
            $table->enum('session_type', ['dinein', 'reservation']); //
            $table->string('ip_address', 45)->nullable(); //
            $table->datetime('expired_at'); //
            $table->enum('status', ['active', 'expired']); //
            $table->timestamps(); //
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('session_token');
    }
};
