<?php

namespace App\Http\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $area_id
 * @property string $area_name
 * @property int $capacity
 * @property int $reservation_price
 * @property int|null $price_unit
 * @property int $minimum_guest
 * @property int $maximum_guest
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Http\Models\Reservation> $reservations
 * @property-read int|null $reservations_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReservationArea newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReservationArea newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReservationArea query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReservationArea whereAreaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReservationArea whereAreaName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReservationArea whereCapacity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReservationArea whereMaximumGuest($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReservationArea whereMinimumGuest($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReservationArea wherePriceUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReservationArea whereReservationPrice($value)
 * @mixin \Eloquent
 */
class ReservationArea extends Model
{
    protected $table = 'reservation_area';
    protected $primaryKey = 'area_id';
    protected $fillable = [
        'area_name',
        'capacity',
        'reservation_price',
        'price_unit',
        'minimum_guest',
        'maximum_guest',
    ];

    public function reservations()
    {
        return $this->hasMany(Reservation::class, 'area_id');
    }
}
