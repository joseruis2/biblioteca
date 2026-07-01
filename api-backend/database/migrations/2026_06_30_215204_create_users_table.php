<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->foreignId('rol_id')->constrained('roles');
                $table->string('nombre', 100);
                $table->string('email', 150)->unique();
                $table->string('password');
                $table->string('numero_socio', 20)->unique()->nullable();
                $table->string('telefono', 20)->nullable();
                $table->tinyInteger('estado')->default(1);
                $table->timestamp('email_verified_at')->nullable();
                $table->rememberToken();
                $table->timestamps();
            });
        }
    }
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
