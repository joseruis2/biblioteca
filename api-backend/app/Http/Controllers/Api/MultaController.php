<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Multa;
use Illuminate\Http\Request;

class MultaController extends Controller
{
    public function index()
    {
        $multas = Multa::with(['user', 'prestamo.libro'])
            ->latest()->paginate(15);
        return response()->json($multas);
    }

    public function pagar($id)
    {
        $multa = Multa::findOrFail($id);

        if ($multa->estado === 'PAGADA') {
            return response()->json(['message' => 'La multa ya fue pagada.'], 422);
        }

        $multa->update([
            'estado'     => 'PAGADA',
            'fecha_pago' => now()->toDateString(),
        ]);

        return response()->json(['message' => 'Multa pagada correctamente.']);
    }
}
