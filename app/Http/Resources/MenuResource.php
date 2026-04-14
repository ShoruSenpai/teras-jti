<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenuResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'menu_id' => $this->menu_id,
            'category' => $this->category->category_name,
            'name' => $this->menu_name,
            'price' => (int) $this->menu_price,
            'image_utl' => $this->image_url,
        ];
    }
}
