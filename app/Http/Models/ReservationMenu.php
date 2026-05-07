<?php

namespace App\Http\Models;

use Illuminate\Database\Eloquent\Model;

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
 * @mixin \Eloquent
 */
class ReservationMenu extends Model
{
    protected $table = 'reservation_menu';
    protected $primarykey = 'reservation_menu_id';
    protected $fillable = ['reservation_id', 'menu_id', 'menu_id', 'qty', 'price', 'subtotal'];
}
