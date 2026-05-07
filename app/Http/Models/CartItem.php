<?php

namespace App\Http\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $cart_item_id
 * @property int $cart_id
 * @property int $menu_id
 * @property string $variant_key
 * @property int $qty
 * @property int $price
 * @property int $subtotal
 * @property-read \App\Http\Models\Menu $menu
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItem whereCartId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItem whereCartItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItem whereMenuId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItem wherePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItem whereQty($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItem whereSubtotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItem whereVariantKey($value)
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Http\Models\CartItemOption> $options
 * @property-read int|null $options_count
 * @mixin \Eloquent
 */
class CartItem extends Model
{
    protected $table = 'cart_item';
    protected $primaryKey = 'cart_item_id';
    public $timestamps = false;
    protected $fillable = ['cart_id', 'menu_id', 'variant_key', 'qty', 'price', 'subtotal'];

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'menu_id', 'menu_id');
    }

    public function options(): hasMany
    {
        return $this->hasMany(CartItemOption::class, 'cart_item_id', 'cart_item_id');
    }
}
