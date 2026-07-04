<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Multa;

class MultaController extends Controller
{
    public function index()
    {
        $multas = Multa::with(['user', 'prestamo.libro'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => $multas->items(),
            'total' => $multas->total(),
        ]);
    }

    public function pagar($id)
    {
        $multa = Multa::findOrFail($id);

        if ($multa->estado === 'PAGADA') {
            return response()->json([
                'message' => 'La multa ya fue pagada.'
            ], 422);
        }

        $multa->update([
            'estado'     => 'PAGADA',
            'fecha_pago' => now()->toDateString(),
        ]);

        return response()->json(['message' => 'Multa pagada correctamente.']);
    }
}
