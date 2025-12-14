-- Add Training Scheduling application to the applications catalog
-- Run this after the applications table exists

INSERT INTO `applications` (
    `app_code`,
    `name`,
    `description`,
    `category`,
    `base_price`,
    `status`,
    `requires_config`
) VALUES (
    'training-scheduler',
    'Training Scheduling',
    'Comprehensive class and training session scheduling system with student registration, payment processing, and instructor management. Perfect for training organizations, educational institutions, and certification programs.',
    'education',
    0.00,
    'active',
    FALSE
) ON DUPLICATE KEY UPDATE
    `name` = VALUES(`name`),
    `description` = VALUES(`description`),
    `category` = VALUES(`category`),
    `updated_at` = CURRENT_TIMESTAMP;

-- Add route for the application
INSERT INTO `application_routes` (
    `app_code`,
    `route_path`,
    `description`
) VALUES (
    'training-scheduler',
    '/training',
    'Training Scheduling application route'
) ON DUPLICATE KEY UPDATE
    `route_path` = VALUES(`route_path`),
    `description` = VALUES(`description`);
