<?php

namespace App\Http\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $category_id
 * @property string $category_name
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Http\Models\Menu> $menus
 * @property-read int|null $menus_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereCategoryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereCategoryName($value)
 * @mixin \Eloquent
 */
class Category extends Model
{
    protected $table = 'menu_category';
    protected $primaryKey = 'category_id';
    protected $fillable = ['category_name'];

    public function menus(): HasMany
    {
        return $this->hasMany(Menu::class, 'category_id', 'category_id');
    }
}
