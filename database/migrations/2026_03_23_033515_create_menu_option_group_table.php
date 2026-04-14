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
        Schema::create('menu_option_group', function (Blueprint $table) {
            $table->increments('option_group_id'); //
            $table->unsignedInteger('menu_id'); //
            $table->string('option_group_name', 50); //

            $table->foreign('menu_id')->references('menu_id')->on('menu_list')->onDelete('cascade'); //
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_option_group');
    }
};
