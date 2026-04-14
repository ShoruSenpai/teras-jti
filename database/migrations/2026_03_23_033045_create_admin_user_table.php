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
        Schema::create('admin_user', function (Blueprint $table) {
            $table->increments('admin_id'); //
            $table->string('supabase_uid', 36)->unique(); //
            $table->string('name', 100); //
            $table->string('email', 100); //
            $table->enum('role', ['owner', 'admin', 'cashier']); //
            $table->timestamps(); // create_at & updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_user');
    }
};
