<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use DateTimeImmutable;
use PDO;

class BannerController extends Controller
{
    public function __construct(protected readonly PDO $db) {}

    public function index(): void
    {
        $now = (new DateTimeImmutable())->format('Y-m-d H:i:s');

        $sql = "
            SELECT * FROM banner_carousel 
            WHERE is_active = 1 
              AND (start_at IS NULL OR start_at <= :now1) 
              AND (end_at IS NULL OR end_at >= :now2) 
            ORDER BY display_order ASC
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'now1' => $now,
            'now2' => $now,
        ]);

        $banners = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $formatedBanners = array_map(function (array $banner) {
            return [
                'id' => $banner['banner_id'],
                'image' => $banner['image_url'],
                'link' => $banner['link_url'] ?? '#',
                'order' => $banner['display_order'] ?? 0,
                'status' => ($banner['is_active'] == 1) ? 'on' : 'off',
            ];
        }, $banners);

        $payload = [
            'data' => $formatedBanners,
            'success' => true,
        ];

        $this->json($payload, 'Banner List');
    }
}
