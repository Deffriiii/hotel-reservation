<?php

// app/Http/Controllers/Api/PaymentController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PaymentController extends Controller
{
    public function index()
    {
        // Jika user adalah admin, tampilkan semua payments
        if (auth()->user()->role === 'admin') {
            $payments = Payment::with(['user', 'reservation'])
                             ->latest()
                             ->paginate(10);
        } else {
            // Jika user biasa, hanya tampilkan payments miliknya
            $payments = Payment::with(['user', 'reservation'])
                             ->where('user_id', auth()->id())
                             ->latest()
                             ->paginate(10);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Payments retrieved successfully',
            'pagination' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'per_page' => $payments->perPage(),
                'total' => $payments->total()
            ],
            'data' => collect($payments->items())->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'amount' => $payment->amount,
                    'payment_method' => $payment->payment_method,
                    'status' => $payment->status,
                    'transaction_id' => $payment->transaction_id,
                    'created_at' => $payment->created_at->format('Y-m-d H:i:s'),
                    'reservation' => [
                        'id' => $payment->reservation->id,
                        'check_in' => $payment->reservation->check_in,
                        'check_out' => $payment->reservation->check_out,
                        'status' => $payment->reservation->status,
                        'total_price' => $payment->reservation->total_price,
                    ],
                    'user' => [
                        'id' => $payment->user->id,
                        'name' => $payment->user->name,
                        'email' => $payment->user->email,
                    ]
                ];
            })
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'reservation_id' => 'required|exists:reservations,id',
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|regex:/^\d{1,8}(\.\d{0,2})?$/',
            'payment_method' => 'required|in:cash,credit_card,bank_transfer',
            'status' => 'required|in:pending,success,failed,refunded',
            'transaction_id' => 'nullable|string',
            'notes' => 'nullable|string'
        ]);

        $payment = Payment::create($validated);
        return response()->json($payment, Response::HTTP_CREATED);
    }

    public function getByReservation($reservationId)
    {
        $payment = Payment::where('reservation_id', $reservationId)->with(['user', 'reservation'])->first();

        if (!$payment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Payment not found for reservation ID ' . $reservationId,
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $payment,
        ]);
    }


    public function show(Payment $payment)
    {
        return response()->json($payment->load(['user', 'reservation']));
    }

    public function update(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'status' => 'sometimes|required|in:pending,success,failed,refunded',
            'notes' => 'nullable|string'
        ]);

        $payment->update($validated);
        return response()->json($payment);
    }

    public function destroy(Payment $payment)
    {
        $payment->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}