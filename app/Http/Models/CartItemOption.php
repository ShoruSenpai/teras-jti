<?php

namespace App\Http\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
