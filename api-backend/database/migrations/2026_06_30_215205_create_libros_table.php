<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    if (!Schema::hasTable('libros')) {
        Schema::create('libros', function (Blueprint $table) {
            $table->id();
            $table->foreignId('categoria_id')->constrained('categorias');
            $table->string('titulo', 255);
            $table->string('isbn', 20)->unique()->nullable();
            $table->string('editorial', 150)->nullable();
            $table->year('anio_publicacion')->nullable();
            $table->text('descripcion')->nullable();
            $table->string('portada_url', 255)->nullable();
            $table->integer('stock_total')->default(1);
            $table->integer('stock_disponible')->default(1);
            $table->tinyInteger('estado')->default(1);
            $table->timestamps();
        });
    }
}
public function down(): void
{
    Schema::dropIfExists('libros');
}
};
