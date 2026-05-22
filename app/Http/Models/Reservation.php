<?php

namespace App\Http\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $reservation_id
 * @property int $session_token_id
 * @property string $reservation_datetime
 * @property int $reservation_duration
 * @property int $area_id
 * @property string $customer_name
 * @property string $customer_phone
 * @property int $guest_count
 * @property int $reservation_total
 * @property string $status
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $confirmed_at
 * @property-read \App\Http\Models\ReservationArea $area
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Http\Models\ReservationMenu> $preorderMenu
 * @property-read int|null $preorder_menu_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reservation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reservation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reservation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reservation whereAreaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reservation whereConfirmedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reservation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reservation whereCustomerName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reservation whereCustomerPhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reservation whereGuestCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reservation whereReservationDatetime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reservation whereReservationDuration($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reservation whereReservationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reservation whereReservationTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reservation whereSessionTokenId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reservation whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reservation whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Reservation extends Model
{
    protected $table = 'reservation';
    protected $primaryKey = 'reservation_id';
    public $timestamps = false;
    protected $fillable = [
        'session_token_id',
        'reservation_datetime',
        'reservation_duration',
        'area_id',
        'customer_name',
        'customer_phone',
        'guest_count',
        'reservation_total',
        'status',
        'confirmed_at',
        'created_at',
        'updated_at',
    ];
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function area(): BelongsTo
    {
        return $this->belongsTo(ReservationArea::class, 'area_id');
    }
    public function preorderMenu(): HasMany
    {
        return $this->hasMany(ReservationMenu::class, 'reservation_id');
    }
}
