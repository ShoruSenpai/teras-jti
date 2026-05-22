<?php

namespace App\Http\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $detail_id
 * @property int $order_id
 * @property int $menu_id
 * @property int $qty
 * @property int $price
 * @property int $subtotal
 * @property-read \App\Http\Models\Menu $menu
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderDetail newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderDetail newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderDetail query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderDetail whereDetailId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderDetail whereMenuId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderDetail whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderDetail wherePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderDetail whereQty($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderDetail whereSubtotal($value)
 * @mixin \Eloquent
 */
class OrderDetail extends Model
{
    protected $table = 'order_detail';
    protected $primaryKey = 'detail_id';
    public $timestamps = false;

    protected $fillable = ['order_id', 'menu_id', 'qty', 'price', 'subtotal'];

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'menu_id', 'menu_id');
    }
}
