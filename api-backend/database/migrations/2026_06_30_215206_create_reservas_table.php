<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    if (!Schema::hasTable('reservas')) {
        Schema::create('reservas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('libro_id')->constrained('libros');
            $table->date('fecha_reserva');
            $table->date('fecha_expira');
            $table->enum('estado', ['PENDIENTE','COMPLETADA','CANCELADA','EXPIRADA'])
                  ->default('PENDIENTE');
            $table->timestamps();
        });
    }
}
public function down(): void
{
    Schema::dropIfExists('reservas');
}
};
