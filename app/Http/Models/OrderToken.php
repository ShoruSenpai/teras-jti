<?php

namespace App\Http\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $order_token_id
 * @property int $session_token_id
 * @property string $token
 * @property int $total_price_estimate
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $expired_at
 * @property string $status
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderToken newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderToken newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderToken query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderToken whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderToken whereExpiredAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderToken whereOrderTokenId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderToken whereSessionTokenId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderToken whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderToken whereToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderToken whereTotalPriceEstimate($value)
 * @mixin \Eloquent
 */
class OrderToken extends Model
{
    protected $table = 'order_token';
    protected $primaryKey = 'order_token_id';
    public $timestamps = false;
    protected $fillable = [
        'session_token_id',
        'token',
        'total_price_estimate',
        'created_at',
        'expired_at',
        'status',
    ];
    protected $casts = [
        'created_at' => 'datetime',
        'expired_at' => 'datetime',
    ];
}
