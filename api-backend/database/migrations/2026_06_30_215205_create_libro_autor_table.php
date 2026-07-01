<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    if (!Schema::hasTable('libro_autor')) {
        Schema::create('libro_autor', function (Blueprint $table) {
            $table->foreignId('libro_id')->constrained('libros')->onDelete('cascade');
            $table->foreignId('autor_id')->constrained('autores')->onDelete('cascade');
            $table->primary(['libro_id', 'autor_id']);
        });
    }
}
public function down(): void
{
    Schema::dropIfExists('libro_autor');
}
};
