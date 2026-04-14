<?php

namespace App\Http\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $banner_id
 * @property string $image_url
 * @property string|null $link_url
 * @property string|null $start_at
 * @property string|null $end_at
 * @property int|null $display_order
 * @property int|null $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Banner newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Banner newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Banner query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Banner whereBannerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Banner whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Banner whereDisplayOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Banner whereEndAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Banner whereImageUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Banner whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Banner whereLinkUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Banner whereStartAt($value)
 * @mixin \Eloquent
 */
class Banner extends Model
{
    protected $table = 'banner_carousel';
    protected $primaryKey = 'banner_id';
    protected $fillable = [
        'image_url',
        'link_url',
        'start_at',
        'end_at',
        'display_order',
        'is_active',
    ];
}
