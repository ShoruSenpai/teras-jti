<?php

namespace App\Http\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $detail_option_id
 * @property int $cart_item_id
 * @property int $option_value_id
 * @property-read \App\Http\Models\MenuOptionValue $option_value
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItemOption newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItemOption newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItemOption query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItemOption whereCartItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItemOption whereDetailOptionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CartItemOption whereOptionValueId($value)
 * @mixin \Eloquent
 */
class CartItemOption extends Model
{
    protected $table = 'cart_item_option';
    protected $primaryKey = 'detail_option_id';
    public $timestamps = false;

    public function option_value(): belongsTo
    {
        return $this->belongsTo(MenuOptionValue::class, 'option_value_id', 'option_value_id');
    }
}
