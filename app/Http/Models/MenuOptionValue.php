<?php

namespace App\Http\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $option_value_id
 * @property int $option_group_id
 * @property string $option_value
 * @property int $extra_price
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuOptionValue newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuOptionValue newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuOptionValue query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuOptionValue whereExtraPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuOptionValue whereOptionGroupId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuOptionValue whereOptionValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuOptionValue whereOptionValueId($value)
 * @mixin \Eloquent
 */
class MenuOptionValue extends Model
{
    protected $table = 'menu_option_value';
    protected $primaryKey = 'option_value_id';
    public $timestamps = false;
    protected $fillable = ['option_group_id', 'option_value', 'extra_price'];
}
