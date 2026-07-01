<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    if (!Schema::hasTable('prestamos')) {
        Schema::create('prestamos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('libro_id')->constrained('libros');
            $table->unsignedBigInteger('bibliotecario_id');
            $table->foreign('bibliotecario_id')->references('id')->on('users');
            $table->date('fecha_prestamo');
            $table->date('fecha_devolucion');
            $table->date('fecha_retorno')->nullable();
            $table->enum('estado', ['ACTIVO','DEVUELTO','VENCIDO'])->default('ACTIVO');
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }
}
public function down(): void
{
    Schema::dropIfExists('prestamos');
}
};
