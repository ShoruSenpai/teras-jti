<?php

namespace App\Http\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $admin_id
 * @property string $name
 * @property string $email
 * @property string $password
 * @property string $role
 * @property string|null $api_token
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserAdmin newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserAdmin newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserAdmin query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserAdmin whereAdminId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserAdmin whereApiToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserAdmin whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserAdmin whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserAdmin whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserAdmin wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserAdmin whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserAdmin whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class UserAdmin extends Model
{
    protected $table = 'user_admin';
    protected $primaryKey = 'admin_id';
    protected $fillable = ['name', 'email', 'password', 'role', 'api_token'];
    protected $hidden = ['password', 'api_token'];
}
