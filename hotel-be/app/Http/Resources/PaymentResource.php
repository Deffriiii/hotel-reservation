<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reservation' => [
                'id' => $this->reservation->id,
                'check_in' => $this->reservation->check_in,
                'check_out' => $this->reservation->check_out,
                'guest_count' => $this->reservation->guest_count,
                'total_price' => $this->reservation->total_price,
                'status' => $this->reservation->status,
                'room' => [
                    'id' => $this->reservation->room->id,
                    'number' => $this->reservation->room->number,
                    'name' => $this->reservation->room->name,
                    'hotel' => [
                        'id' => $this->reservation->room->hotel->id,
                        'name' => $this->reservation->room->hotel->name,
                    ],
                ],
            ],
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ],
            'payment_method' => $this->payment_method,
            'amount' => $this->amount,
            'formatted_amount' => 'Rp ' . number_format($this->amount, 2, ',', '.'),
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}