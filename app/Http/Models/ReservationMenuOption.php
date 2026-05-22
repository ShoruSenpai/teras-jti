<?php

namespace App\Http\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $reservation_option_id
 * @property int $reservation_menu_id
 * @property int $option_value_id
 * @property-read \App\Http\Models\MenuOptionValue $optionValue
 * @property-read \App\Http\Models\ReservationMenu $reservationMenu
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReservationMenuOption newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReservationMenuOption newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReservationMenuOption query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReservationMenuOption whereOptionValueId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReservationMenuOption whereReservationMenuId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReservationMenuOption whereReservationOptionId($value)
 * @mixin \Eloquent
 */
class ReservationMenuOption extends Model
{
    protected $table = 'reservation_menu_option';
    protected $primaryKey = 'reservation_option_id';
    protected $fillable = ['reservation_menu_id', 'option_value_id'];
    public $timestamps = false;

    public function reservationMenu(): BelongsTo
    {
        return $this->belongsTo(
            ReservationMenu::class,
            'reservation_menu_id',
            'reservation_menu_id',
        );
    }

    public function optionValue(): BelongsTo
    {
        return $this->belongsTo(MenuOptionValue::class, 'option_value_id', 'option_value_id');
    }
}
