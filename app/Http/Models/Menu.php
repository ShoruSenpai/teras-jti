<?php

namespace App\Http\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $menu_id
 * @property int $category_id
 * @property string $menu_name
 * @property string|null $menu_description
 * @property int $menu_price
 * @property int $menu_stock
 * @property string|null $menu_image
 * @property int $is_new
 * @property int $is_recommended
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string $status
 * @property-read \App\Http\Models\Category $category
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Menu newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Menu newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Menu query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Menu whereCategoryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Menu whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Menu whereIsNew($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Menu whereIsRecommended($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Menu whereMenuDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Menu whereMenuId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Menu whereMenuImage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Menu whereMenuName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Menu whereMenuPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Menu whereMenuStock($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Menu whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Menu whereUpdatedAt($value)
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Http\Models\MenuOptionGroup> $optionGroup
 * @property-read int|null $option_group_count
 * @mixin \Eloquent
 */
class Menu extends Model
{
    protected $table = 'menu_list';
    protected $primaryKey = 'menu_id';
    protected $fillable = [
        'category_id',
        'menu_name',
        'menu_description',
        'menu_price',
        'menu_stock',
        'menu_image',
        'is_new',
        'is_recommended',
        'status',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id');
    }

    public function optionGroup(): HasMany
    {
        return $this->hasMany(MenuOptionGroup::class, 'menu_id', 'menu_id');
    }
}
