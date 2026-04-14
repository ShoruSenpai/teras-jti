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
        Schema::create('reservation_area', function (Blueprint $table) {
            $table->increments('area_id');
            $table->string('area_name', 255);
            $table->unsignedInteger('capacity');
            $table->unsignedInteger('reservation_price')->default(0);
            $table->unsignedInteger('minimum_guest');
            $table->unsignedInteger('maximum_guest');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservation_area');
    }
};
