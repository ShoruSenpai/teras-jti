<?php
namespace App\Http\Models;
use PDO;

class Menu {
    public function __construct(private PDO $db) {}

    public function getAvailableWithRelations() {
        $sql = "SELECT m.*, c.category_name 
                FROM menus m 
                LEFT JOIN categories c ON m.category_id = c.category_id
                WHERE m.status IN ('available', 'sold_out')";
        $stmt = $this->db->query($sql);
        $menus = $stmt->fetchAll();

        foreach ($menus as &$menu) {
            $stmtGrp = $this->db->prepare("SELECT * FROM menu_option_groups WHERE menu_id = ?");
            $stmtGrp->execute([$menu['menu_id']]);
            $groups = $stmtGrp->fetchAll();

            foreach ($groups as &$group) {
                $stmtVal = $this->db->prepare("SELECT * FROM menu_option_values WHERE option_group_id = ?");
                $stmtVal->execute([$group['option_group_id']]);
                $group['options'] = $stmtVal->fetchAll();
            }
            $menu['option_group'] = $groups;
        }
        return $menus;
    }
}