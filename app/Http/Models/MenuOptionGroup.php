<?php

namespace App\Http\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $option_group_id
 * @property int $menu_id
 * @property string $option_group_name
 * @property-read \Illuminate\Database\Eloquent\Collection<int, MenuOptionValue> $options
 * @property-read int|null $options_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuOptionGroup newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuOptionGroup newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuOptionGroup query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuOptionGroup whereMenuId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuOptionGroup whereOptionGroupId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuOptionGroup whereOptionGroupName($value)
 * @mixin \Eloquent
 */
class MenuOptionGroup extends Model
{
    protected $table = 'menu_option_group';
    protected $primaryKey = 'option_group_id';
    public $timestamps = false;
    protected $fillable = ['menu_id', 'option_group_name'];

    public function options(): HasMany
    {
        return $this->hasMany(MenuOptionValue::class, 'option_group_id', 'option_group_id');
    }
}
