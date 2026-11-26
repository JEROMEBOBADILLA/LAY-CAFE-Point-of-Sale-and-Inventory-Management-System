-- LAY CAFE | Updated WBS schema using your EXISTING laycafedb database.
-- IMPORTANT: Back up laycafedb in phpMyAdmin (Export) before importing this file.
-- This script does NOT DROP tables or DELETE rows.
-- Original cafe_users, cafe_products, cafe_orders, cafe_order_items,
-- cafe_sessions, and stock_movements remain untouched by this SQL.
-- The updated app uses its own users/products/sales tables but SHARES
-- the existing inventory table with the original app.
-- Set Backend/.env -> DB_NAME=laycafedb.  npm run seed also imports this schema automatically.
-- Back up the existing laycafedb before running the setup/seed.
-- Do not import another schema.sql copied from older LayCafe ZIP versions.

CREATE DATABASE IF NOT EXISTS `laycafedb`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `laycafedb`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(60) NOT NULL UNIQUE,
  `full_name` VARCHAR(120) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('admin','cashier','kitchen') NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `products` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(190) NOT NULL,
  `category` VARCHAR(80) NOT NULL,
  `price` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_products_name_category` (`name`, `category`)
) ENGINE=InnoDB;

-- Only creates inventory if it does not already exist. Preserves old rows.
CREATE TABLE IF NOT EXISTS `inventory` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(160) NOT NULL UNIQUE,
  `category` ENUM('Ingredient','Supply') NOT NULL,
  `quantity` DECIMAL(12,3) NOT NULL DEFAULT 0,
  `unit` VARCHAR(24) NOT NULL,
  `reorder_level` DECIMAL(12,3) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (`quantity` >= 0),
  CHECK (`reorder_level` >= 0)
) ENGINE=InnoDB;

-- Legacy inventory may lack the is_active column required by the new backend.
-- Add it ONLY if missing. Works with MySQL and MariaDB without
-- relying on ALTER TABLE ... ADD COLUMN IF NOT EXISTS support.
SET @inventory_is_active_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'inventory'
    AND COLUMN_NAME = 'is_active'
);
SET @inventory_alter_sql = IF(
  @inventory_is_active_exists = 0,
  'ALTER TABLE `inventory` ADD COLUMN `is_active` TINYINT(1) NOT NULL DEFAULT 1',
  'SELECT ''inventory.is_active already exists'' AS info'
);
PREPARE laycafe_alter_inventory FROM @inventory_alter_sql;
EXECUTE laycafe_alter_inventory;
DEALLOCATE PREPARE laycafe_alter_inventory;

CREATE TABLE IF NOT EXISTS `sales` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `customer_name` VARCHAR(120) NOT NULL DEFAULT 'Walk-in',
  `order_type` ENUM('dine_in','take_out') NOT NULL DEFAULT 'dine_in',
  `total_amount` DECIMAL(12,2) NOT NULL,
  `payment` DECIMAL(12,2) NOT NULL,
  `change_amount` DECIMAL(12,2) NOT NULL,
  `status` ENUM('pending','preparing','ready','completed') NOT NULL DEFAULT 'pending',
  `cashier_id` INT UNSIGNED NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_sales_cashier` FOREIGN KEY (`cashier_id`)
    REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_sales_created` (`created_at`),
  INDEX `idx_sales_status` (`status`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `sale_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `sale_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `quantity` INT UNSIGNED NOT NULL,
  `unit_price` DECIMAL(12,2) NOT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL,
  CONSTRAINT `fk_si_sale` FOREIGN KEY (`sale_id`)
    REFERENCES `sales` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_si_product` FOREIGN KEY (`product_id`)
    REFERENCES `products` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Safely upgrade sales created by older LayCafe ZIPs without deleting any rows.
-- Existing orders are labeled Dine In; only new checkouts require an explicit choice.
SET @sales_order_type_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'sales'
    AND COLUMN_NAME = 'order_type'
);
SET @sales_alter_sql = IF(
  @sales_order_type_exists = 0,
  'ALTER TABLE `sales` ADD COLUMN `order_type` ENUM(''dine_in'',''take_out'') NOT NULL DEFAULT ''dine_in'' AFTER `customer_name`',
  'SELECT ''sales.order_type already exists'' AS info'
);
PREPARE laycafe_alter_sales FROM @sales_alter_sql;
EXECUTE laycafe_alter_sales;
DEALLOCATE PREPARE laycafe_alter_sales;

-- Match the existing inventory.id datatype (INT vs INT UNSIGNED).
-- Otherwise MySQL can reject foreign keys when legacy id is signed.
SET @inventory_id_type = (
  SELECT COLUMN_TYPE FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'inventory'
    AND COLUMN_NAME = 'id'
  LIMIT 1
);

SET @create_recipe_sql = CONCAT(
  'CREATE TABLE IF NOT EXISTS `product_inventory` (',
  ' `product_id` INT UNSIGNED NOT NULL,',
  ' `inventory_id` ', @inventory_id_type, ' NOT NULL,',
  ' `quantity_required` DECIMAL(12,3) NOT NULL,',
  ' PRIMARY KEY (`product_id`, `inventory_id`),',
  ' CONSTRAINT `fk_recipe_product` FOREIGN KEY (`product_id`)',
  ' REFERENCES `products` (`id`) ON DELETE CASCADE,',
  ' CONSTRAINT `fk_recipe_inventory` FOREIGN KEY (`inventory_id`)',
  ' REFERENCES `inventory` (`id`) ON DELETE RESTRICT,',
  ' CHECK (`quantity_required` > 0)',
  ') ENGINE=InnoDB'
);
PREPARE laycafe_create_recipe FROM @create_recipe_sql;
EXECUTE laycafe_create_recipe;
DEALLOCATE PREPARE laycafe_create_recipe;

SET @create_movement_sql = CONCAT(
  'CREATE TABLE IF NOT EXISTS `inventory_movements` (',
  ' `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,',
  ' `inventory_id` ', @inventory_id_type, ' NOT NULL,',
  ' `sale_id` INT UNSIGNED NULL,',
  ' `movement_type` ENUM(''initial'',''restock'',''adjustment'',''sale'') NOT NULL,',
  ' `quantity_change` DECIMAL(12,3) NOT NULL,',
  ' `note` VARCHAR(255) NOT NULL DEFAULT '''',',
  ' `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,',
  ' CONSTRAINT `fk_mv_inventory` FOREIGN KEY (`inventory_id`)',
  ' REFERENCES `inventory` (`id`) ON DELETE RESTRICT,',
  ' CONSTRAINT `fk_mv_sale` FOREIGN KEY (`sale_id`)',
  ' REFERENCES `sales` (`id`) ON DELETE SET NULL,',
  ' INDEX `idx_mv_item_date` (`inventory_id`, `created_at`)',
  ') ENGINE=InnoDB'
);
PREPARE laycafe_create_movement FROM @create_movement_sql;
EXECUTE laycafe_create_movement;
DEALLOCATE PREPARE laycafe_create_movement;

-- Confirm the database currently selected and its core tables.
SELECT DATABASE() AS `connected_database`;
SELECT TABLE_NAME AS `updated_table`
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN (
    'users','products','inventory','product_inventory',
    'sales','sale_items','inventory_movements'
  )
ORDER BY TABLE_NAME;
