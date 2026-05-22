<?php

namespace App\Http\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $order_id
 * @property int|null $order_token_id
 * @property string $token
 * @property string $order_method
 * @property string $order_type
 * @property string $order_time
 * @property string|null $paid_at
 * @property int $total_price
 * @property string $status
 * @property int|null $cashier_id
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Http\Models\OrderDetail> $details
 * @property-read int|null $details_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderHistory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderHistory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderHistory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderHistory whereCashierId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderHistory whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderHistory whereOrderMethod($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderHistory whereOrderTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderHistory whereOrderTokenId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderHistory whereOrderType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderHistory wherePaidAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderHistory whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderHistory whereToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderHistory whereTotalPrice($value)
 * @mixin \Eloquent
 */
class OrderHistory extends Model
{
    protected $table = 'order_history';
    protected $primaryKey = 'order_id';
    public $timestamps = false;
    protected $fillable = [
        'order_token_id',
        'token',
        'order_method',
        'order_type',
        'order_time',
        'paid_at',
        'total_price',
        'status',
        'cashier_id',
    ];

    public function details(): HasMany
    {
        return $this->hasMany(OrderDetail::class, 'order_id', 'order_id');
    }
}
