-- Training Scheduling Application Database Schema
-- This creates the tables needed for the Training Scheduling application
-- All tables are tenant-scoped for multi-tenant support

-- Categories table - stores class categories (tenant-scoped)
CREATE TABLE IF NOT EXISTS `training_categories` (
    `id` VARCHAR(50) NOT NULL,
    `tenant_id` INT(11) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `display_name` VARCHAR(100) NOT NULL,
    `icon` VARCHAR(50),
    `sort_order` INT DEFAULT 0,
    `active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`, `tenant_id`),
    FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE,
    INDEX `idx_tenant_active` (`tenant_id`, `active`),
    INDEX `idx_sort_order` (`tenant_id`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Classes table - stores class definitions (tenant-scoped)
CREATE TABLE IF NOT EXISTS `training_classes` (
    `id` VARCHAR(50) NOT NULL,
    `tenant_id` INT(11) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `level` VARCHAR(50) NOT NULL,
    `duration` VARCHAR(50) NOT NULL,
    `tuition` DECIMAL(10, 2) NOT NULL,
    `category` VARCHAR(50) DEFAULT 'other',
    `sort_order` INT DEFAULT 0,
    `badge` VARCHAR(100),
    `summary` TEXT,
    `description` TEXT,
    `highlights` TEXT,
    `equipment` TEXT,
    `prerequisites` TEXT,
    `active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`, `tenant_id`),
    FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`category`, `tenant_id`) REFERENCES `training_categories`(`id`, `tenant_id`) ON DELETE SET NULL,
    INDEX `idx_tenant_active` (`tenant_id`, `active`),
    INDEX `idx_level` (`tenant_id`, `level`),
    INDEX `idx_category` (`tenant_id`, `category`),
    INDEX `idx_sort_order` (`tenant_id`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Class sessions table - stores scheduled sessions for each class (tenant-scoped)
CREATE TABLE IF NOT EXISTS `training_class_sessions` (
    `id` VARCHAR(100) NOT NULL,
    `tenant_id` INT(11) NOT NULL,
    `class_id` VARCHAR(50) NOT NULL,
    `date` DATE NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `location` VARCHAR(255),
    `instructor` VARCHAR(255),
    `max_seats` INT DEFAULT 12,
    `available_seats` INT DEFAULT 12,
    `status` ENUM('scheduled', 'full', 'cancelled', 'completed') DEFAULT 'scheduled',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`, `tenant_id`),
    FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`class_id`, `tenant_id`) REFERENCES `training_classes`(`id`, `tenant_id`) ON DELETE CASCADE,
    INDEX `idx_tenant_class` (`tenant_id`, `class_id`),
    INDEX `idx_date` (`tenant_id`, `date`),
    INDEX `idx_status` (`tenant_id`, `status`),
    INDEX `idx_class_date` (`tenant_id`, `class_id`, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registrations table - stores student registrations (tenant-scoped)
CREATE TABLE IF NOT EXISTS `training_registrations` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `tenant_id` INT(11) NOT NULL,
    `transaction_id` VARCHAR(100) NOT NULL,
    `class_id` VARCHAR(50) NOT NULL,
    `session_id` VARCHAR(100) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `experience_level` VARCHAR(50) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('pending', 'confirmed', 'cancelled', 'refunded') DEFAULT 'confirmed',
    `auth_code` VARCHAR(50),
    `waiver_accepted` BOOLEAN DEFAULT FALSE,
    `rules_accepted` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`class_id`, `tenant_id`) REFERENCES `training_classes`(`id`, `tenant_id`) ON DELETE RESTRICT,
    FOREIGN KEY (`session_id`, `tenant_id`) REFERENCES `training_class_sessions`(`id`, `tenant_id`) ON DELETE RESTRICT,
    UNIQUE KEY `unique_transaction_tenant` (`transaction_id`, `tenant_id`),
    INDEX `idx_tenant_class` (`tenant_id`, `class_id`),
    INDEX `idx_tenant_session` (`tenant_id`, `session_id`),
    INDEX `idx_email` (`tenant_id`, `email`),
    INDEX `idx_status` (`tenant_id`, `status`),
    INDEX `idx_created_at` (`tenant_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Instructors table - stores instructor information (tenant-scoped)
CREATE TABLE IF NOT EXISTS `training_instructors` (
    `id` VARCHAR(50) NOT NULL,
    `tenant_id` INT(11) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `role` VARCHAR(100) NOT NULL,
    `photo_path` VARCHAR(255),
    `summary` TEXT,
    `background` TEXT,
    `operational_experience` TEXT,
    `training_philosophy` TEXT,
    `quote` TEXT,
    `quote_author` VARCHAR(255),
    `meta_years` VARCHAR(50),
    `meta_deployments` VARCHAR(50),
    `meta_focus` VARCHAR(100),
    `certifications` TEXT,
    `expertise` TEXT,
    `programs` TEXT,
    `courses_led` TEXT,
    `sort_order` INT DEFAULT 0,
    `active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`, `tenant_id`),
    FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE,
    INDEX `idx_tenant_active` (`tenant_id`, `active`),
    INDEX `idx_sort_order` (`tenant_id`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contact messages table - stores contact form submissions (tenant-scoped)
CREATE TABLE IF NOT EXISTS `training_contact_messages` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `tenant_id` INT(11) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20),
    `subject` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
    `admin_response` TEXT,
    `responded_by` INT(11),
    `responded_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE,
    INDEX `idx_tenant_email` (`tenant_id`, `email`),
    INDEX `idx_status` (`tenant_id`, `status`),
    INDEX `idx_created_at` (`tenant_id`, `created_at`),
    INDEX `idx_status_created` (`tenant_id`, `status`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
