<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Libro;
use App\Models\Multa;
use App\Models\Prestamo;
use App\Models\Reserva;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // Stats principales
        $totalLibros    = Libro::where('estado', 1)->count();
        $totalUsuarios  = User::where('estado', 1)->count();
        $totalSocios    = User::whereHas('rol', fn($q) => $q->where('nombre', 'SOCIO'))->count();
        $prestamosActivos = Prestamo::where('estado', 'ACTIVO')->count();
        $prestamosVencidos = Prestamo::where('estado', 'VENCIDO')->count();
        $reservasPendientes = Reserva::where('estado', 'PENDIENTE')->count();
        $multasPendientes = Multa::where('estado', 'PENDIENTE')->count();
        $multasMonto = Multa::where('estado', 'PENDIENTE')->sum('monto');

        // Préstamos últimos 7 días
        $prestamosRecientes = Prestamo::with(['socio', 'libro'])
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($p) => [
                'id'               => $p->id,
                'socio'            => $p->socio?->nombre,
                'libro'            => $p->libro?->titulo,
                'fecha_devolucion' => $p->fecha_devolucion,
                'estado'           => $p->estado,
            ]);

        // Libros más prestados
        $librosMasPrestados = DB::table('prestamos')
            ->join('libros', 'prestamos.libro_id', '=', 'libros.id')
            ->select('libros.titulo', DB::raw('COUNT(*) as total'))
            ->groupBy('libros.id', 'libros.titulo')
            ->orderByDesc('total')
            ->take(5)
            ->get();

        // Reservas pendientes recientes
        $reservasRecientes = Reserva::with(['user', 'libro'])
            ->where('estado', 'PENDIENTE')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($r) => [
                'id'           => $r->id,
                'socio'        => $r->user?->nombre,
                'libro'        => $r->libro?->titulo,
                'fecha_expira' => $r->fecha_expira,
            ]);

        return response()->json([
            'stats' => [
                'total_libros'        => $totalLibros,
                'total_usuarios'      => $totalUsuarios,
                'total_socios'        => $totalSocios,
                'prestamos_activos'   => $prestamosActivos,
                'prestamos_vencidos'  => $prestamosVencidos,
                'reservas_pendientes' => $reservasPendientes,
                'multas_pendientes'   => $multasPendientes,
                'multas_monto'        => $multasMonto,
            ],
            'prestamos_recientes'  => $prestamosRecientes,
            'libros_mas_prestados' => $librosMasPrestados,
            'reservas_recientes'   => $reservasRecientes,
        ]);
    }
}
