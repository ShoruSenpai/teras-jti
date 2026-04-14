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
        Schema::create('menu_list', function (Blueprint $table) {
            $table->increments('menu_id'); //
            $table->unsignedInteger('category_id'); //
            $table->string('menu_name', 100); //
            $table->text('menu_description')->nullable(); //
            $table->unsignedInteger('menu_price')->default(0); //
            $table->integer('menu_stock')->default(0); //
            $table->string('menu_image')->nullable(); //
            $table->boolean('is_new')->default(0); //
            $table->boolean('is_recommended')->default(0); //
            $table->enum('status', ['available', 'sold_out', 'disabled']); //
            $table->timestamps(); //

            $table->foreign('category_id')->references('category_id')->on('menu_category'); //
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_list');
    }
};
