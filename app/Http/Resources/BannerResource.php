<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BannerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->banner_id,
            'image' => $this->image_url,
            'link' => $this->link_url ?? '#',
            'order' => $this->display_order ?? '0',
            'status' => 'on',
        ];
    }
}
