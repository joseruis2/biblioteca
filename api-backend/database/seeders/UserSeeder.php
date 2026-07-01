<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $rolAdmin = Rol::where('nombre', 'ADMIN')->first();

        User::firstOrCreate(
            ['email' => 'admin@biblioteca.com'],
            [
                'rol_id'   => $rolAdmin->id,
                'nombre'   => 'Administrador',
                'password' => Hash::make('admin123'),
                'estado'   => 1,
            ]
        );
    }
}
