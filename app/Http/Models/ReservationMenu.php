<?php

namespace App\Http\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $reservation_menu_id
 * @property int $reservation_id
 * @property int $menu_id
 * @property int $qty
 * @property int $price
 * @property int $subtotal
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReservationMenu newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReservationMenu newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReservationMenu query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReservationMenu whereMenuId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReservationMenu wherePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReservationMenu whereQty($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReservationMenu whereReservationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReservationMenu whereReservationMenuId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReservationMenu whereSubtotal($value)
 * @property-read \App\Http\Models\Menu $menu
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Http\Models\ReservationMenuOption> $options
 * @property-read int|null $options_count
 * @property-read \App\Http\Models\Reservation $reservation
 * @mixin \Eloquent
 */
class ReservationMenu extends Model
{
    protected $table = 'reservation_menu';
    protected $primaryKey = 'reservation_menu_id';
    protected $fillable = ['reservation_id', 'menu_id', 'qty', 'price', 'subtotal'];
    public $timestamps = false;

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class, 'reservation_id', 'reservation_id');
    }

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'menu_id', 'menu_id');
    }

    public function options(): HasMany
    {
        return $this->hasMany(
            ReservationMenuOption::class,
            'reservation_menu_id',
            'reservation_menu_id',
        );
    }
}
