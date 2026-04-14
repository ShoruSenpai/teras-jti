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
        Schema::create('menu_option_value', function (Blueprint $table) {
            $table->increments('option_value_id'); //
            $table->unsignedInteger('option_group_id'); //
            $table->string('option_value', 50); //
            $table->unsignedInteger('extra_price')->default(0); //

            $table->foreign('option_group_id')->references('option_group_id')->on('menu_option_group')->onDelete('cascade'); //
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_option_value');
    }
};
