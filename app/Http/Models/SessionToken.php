<?php

namespace App\Http\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionToken newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionToken newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionToken query()
 * @property int $token_id
 * @property string $token
 * @property string $session_type
 * @property string $ip_address
 * @property numeric $latitude
 * @property numeric $longitude
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $expired_at
 * @property string $status
 * @property-read \App\Http\Models\Cart|null $Cart
 * @property-read \App\Http\Models\OrderToken|null $orderToken
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionToken whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionToken whereExpiredAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionToken whereIpAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionToken whereLatitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionToken whereLongitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionToken whereSessionType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionToken whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionToken whereToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionToken whereTokenId($value)
 * @mixin \Eloquent
 */
class SessionToken extends Model
{
    protected $table = 'session_token';
    protected $primaryKey = 'token_id';
    public $timestamps = false;
    protected $fillable = [
        'token',
        'session_type',
        'ip_address',
        'latitude',
        'longitude',
        'created_at',
        'expired_at',
        'status',
    ];
    protected $casts = [
        'created_at' => 'datetime',
        'expired_at' => 'datetime',
    ];

    function orderToken()
    {
        return $this->hasOne(OrderToken::class, 'session_token_id', 'token_id');
    }

    function Cart()
    {
        return $this->hasOne(Cart::class, 'session_token_id', 'token_id');
    }
}
