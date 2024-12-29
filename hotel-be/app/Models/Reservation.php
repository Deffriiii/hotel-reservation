<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'room_id',
        'check_in',
        'check_out',
        'guest_count',
        'total_price',
        'status',
        'special_requests',
    ];

    protected $casts = [
        'check_in' => 'date',
        'check_out' => 'date',
        'total_price' => 'decimal:2',
    ];

    // Relasi ke User
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Relasi ke Room
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    // Relasi ke Hotel melalui Room
    public function hotel()
    {
        return $this->room ? $this->room->hotel : null;
    }
        
    // app/Models/Reservation.php
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
