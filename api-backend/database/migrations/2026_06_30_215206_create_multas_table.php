<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    if (!Schema::hasTable('multas')) {
        Schema::create('multas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prestamo_id')->unique()->constrained('prestamos');
            $table->foreignId('user_id')->constrained('users');
            $table->integer('dias_retraso')->default(0);
            $table->decimal('monto', 8, 2)->default(0.00);
            $table->enum('estado', ['PENDIENTE','PAGADA'])->default('PENDIENTE');
            $table->date('fecha_pago')->nullable();
            $table->timestamps();
        });
    }
}
public function down(): void
{
    Schema::dropIfExists('multas');
}
};
