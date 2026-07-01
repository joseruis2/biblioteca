<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    if (!Schema::hasTable('autores')) {
        Schema::create('autores', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 150);
            $table->string('nacionalidad', 100)->nullable();
            $table->text('biografia')->nullable();
            $table->timestamps();
        });
    }
}
public function down(): void
{
    Schema::dropIfExists('autores');
}
};
