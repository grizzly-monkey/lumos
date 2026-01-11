-- ============================================
-- NIGHTWATCH DATABASE SCHEMA
-- MariaDB 11.7+ with Native Vector Support
-- For use with Google Gemini AI
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS nightwatch_db;
USE nightwatch_db;

-- ============================================
-- DROP EXISTING TABLES (for clean install)
-- ============================================
DROP TABLE IF EXISTS `action_history`;
DROP TABLE IF EXISTS `baseline_patterns`;
DROP TABLE IF EXISTS `agent_actions`;
DROP TABLE IF EXISTS `incidents`;
DROP TABLE IF EXISTS `metrics`;
DROP TABLE IF EXISTS `databases`;

-- ============================================
-- 1. DATABASES TABLE (Monitored instances)
-- ============================================
CREATE TABLE `databases`
(
    `id`         INT AUTO_INCREMENT PRIMARY KEY,
    `name`       VARCHAR(255) NOT NULL UNIQUE,
    `host`       VARCHAR(255) DEFAULT 'localhost',
    `port`       INT DEFAULT 3306,
    `status`     ENUM ('healthy', 'warning', 'critical', 'offline') NOT NULL DEFAULT 'healthy',
    `metadata`   JSON,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='Catalog of monitored database instances';

-- ============================================
-- 2. METRICS TABLE (Time-series data)
-- ============================================
CREATE TABLE `metrics`
(
    `id`                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    `database_id`             INT NOT NULL,
    `timestamp`               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `cpu_percent`             FLOAT DEFAULT 0,
    `memory_percent`          FLOAT DEFAULT 0,
    `active_connections`      INT DEFAULT 0,
    `max_connections`         INT DEFAULT 100,
    `slow_queries_count`      INT DEFAULT 0,
    `disk_usage_percent`      FLOAT DEFAULT 0,
    `disk_free_gb`            FLOAT DEFAULT 0,
    `queries_per_second`      FLOAT DEFAULT 0,
    `avg_query_time_ms`       FLOAT DEFAULT 0,
    `deadlocks_count`         INT DEFAULT 0,
    `replication_lag_seconds` INT DEFAULT 0,
    `buffer_pool_hit_rate`    FLOAT DEFAULT 99.0,
    INDEX `idx_metrics_db_timestamp` (`database_id`, `timestamp`),
    INDEX `idx_metrics_timestamp` (`timestamp`),
    FOREIGN KEY (`database_id`) REFERENCES `databases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='Time-series data for database health monitoring';

-- ============================================
-- 3. INCIDENTS TABLE (Detected issues)
-- ============================================
CREATE TABLE `incidents`
(
    `id`                      INT AUTO_INCREMENT PRIMARY KEY,
    `database_id`             INT NOT NULL,
    `timestamp`               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `issue_type`              VARCHAR(100) NOT NULL,
    `severity`                ENUM ('low', 'medium', 'high', 'critical') NOT NULL,
    `symptoms`                TEXT NOT NULL,
    `metrics_snapshot`        JSON COMMENT 'Metrics at time of incident',
    `symptoms_embedding`      BLOB COMMENT 'Vector embedding as binary',
    `status`                  ENUM ('open', 'investigating', 'resolved', 'failed') NOT NULL DEFAULT 'open',
    `fix_applied`             VARCHAR(255),
    `fix_details`             TEXT,
    `success`                 BOOLEAN DEFAULT NULL,
    `performance_improvement` FLOAT,
    `time_to_resolve`         INT COMMENT 'Resolution time in seconds',
    `auto_resolved`           BOOLEAN DEFAULT FALSE,
    `resolved_at`             TIMESTAMP NULL,
    `resolution_notes`        TEXT,
    INDEX `idx_incidents_type_status` (`issue_type`, `status`),
    INDEX `idx_incidents_timestamp` (`timestamp`),
    FOREIGN KEY (`database_id`) REFERENCES `databases` (`id`) ON DELETE CASCADE,
    -- **THE FIX**: Added the required vector index for performance.
    VECTOR INDEX `idx_symptoms_embedding` (`symptoms_embedding`) DISTANCE=cosine
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='Records of detected database incidents';

-- ============================================
-- 4. AGENT_ACTIONS TABLE (AI agent actions)
-- ============================================
CREATE TABLE `agent_actions`
(
    `id`                      INT AUTO_INCREMENT PRIMARY KEY,
    `incident_id`             INT NOT NULL,
    `timestamp`               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `action_type`             VARCHAR(100) NOT NULL,
    `action_details`          TEXT,
    `confidence_score`        FLOAT COMMENT '0-100 confidence percentage',
    `similar_incidents_found` INT DEFAULT 0,
    `status`                  ENUM ('pending', 'executing', 'success', 'failed', 'rolled_back') DEFAULT 'pending',
    `execution_time_ms`       INT,
    `result_notes`            TEXT,
    `error_message`           TEXT,
    `rollback_plan`           TEXT,
    `rollback_executed`       BOOLEAN DEFAULT FALSE,
    INDEX `idx_actions_incident` (`incident_id`),
    FOREIGN KEY (`incident_id`) REFERENCES `incidents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='Log of all actions performed by the DBA agent';

-- ============================================
-- 5. BASELINE_PATTERNS TABLE (Normal behavior)
-- ============================================
CREATE TABLE `baseline_patterns`
(
    `id`                INT AUTO_INCREMENT PRIMARY KEY,
    `database_id`       INT NOT NULL,
    `pattern_name`      VARCHAR(255) NOT NULL,
    `pattern_type`      VARCHAR(100) DEFAULT 'hourly' COMMENT 'hourly, daily, weekly',
    `time_period`       VARCHAR(50),
    `pattern_data`      JSON NOT NULL,
    `pattern_embedding` BLOB COMMENT 'Vector stored as binary',
    `sample_count`      INT DEFAULT 0,
    `created_at`        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_db_pattern` (`database_id`, `pattern_name`),
    FOREIGN KEY (`database_id`) REFERENCES `databases` (`id`) ON DELETE CASCADE,
    -- **THE FIX**: Added the required vector index for performance.
    VECTOR INDEX `idx_pattern_embedding` (`pattern_embedding`) DISTANCE=cosine
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='Learned baseline behavior patterns for anomaly detection';

-- ============================================
-- 6. ACTION_HISTORY TABLE (Audit log)
-- ============================================
CREATE TABLE `action_history`
(
    `id`          BIGINT AUTO_INCREMENT PRIMARY KEY,
    `timestamp`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `database_id` INT NOT NULL,
    `action_type` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `executed_by` ENUM ('ai_agent', 'dba', 'scheduled_task') NOT NULL DEFAULT 'ai_agent',
    `success`     BOOLEAN NOT NULL,
    `details`     JSON,
    INDEX `idx_history_timestamp` (`timestamp`),
    INDEX `idx_history_database` (`database_id`),
    INDEX `idx_history_action` (`action_type`),
    FOREIGN KEY (`database_id`) REFERENCES `databases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='Audit log of all database actions';

-- ============================================
-- INSERT SEED DATA
-- ============================================

-- Insert monitored databases
INSERT INTO `databases` (`name`, `host`, `port`, `status`) VALUES
                                                               ('Orders', 'localhost', 3306, 'healthy'),
                                                               ('Products', 'localhost', 3306, 'healthy'),
                                                               ('Users', 'localhost', 3306, 'warning'),
                                                               ('Analytics', 'localhost', 3306, 'healthy');

-- Insert sample metrics for each database
INSERT INTO `metrics` (`database_id`, `cpu_percent`, `memory_percent`, `active_connections`, `max_connections`, `slow_queries_count`, `disk_usage_percent`, `disk_free_gb`, `queries_per_second`, `avg_query_time_ms`)
SELECT id, 35.5, 48.2, 45, 200, 2, 62.0, 150.5, 850, 12.5 FROM `databases` WHERE name = 'Orders'
UNION ALL
SELECT id, 28.0, 42.5, 32, 200, 1, 55.0, 180.2, 620, 8.3 FROM `databases` WHERE name = 'Products'
UNION ALL
SELECT id, 78.0, 82.8, 178, 200, 15, 70.0, 120.0, 1200, 45.2 FROM `databases` WHERE name = 'Users'
UNION ALL
SELECT id, 45.0, 52.0, 25, 100, 3, 45.0, 250.0, 350, 18.0 FROM `databases` WHERE name = 'Analytics';

-- Insert sample incidents
INSERT INTO `incidents` (`database_id`, `issue_type`, `severity`, `symptoms`, `metrics_snapshot`, `status`)
SELECT
    id,
    'high_cpu',
    'high',
    'CPU usage at 78% approaching threshold of 85%. 15 slow queries detected in last 5 minutes.',
    JSON_OBJECT(
            'cpu_percent', 78.0,
            'memory_percent', 82.8,
            'active_connections', 178,
            'slow_queries_count', 15,
            'queries_per_second', 1200
    ),
    'open'
FROM `databases` WHERE name = 'Users';

INSERT INTO `incidents` (`database_id`, `issue_type`, `severity`, `symptoms`, `metrics_snapshot`, `status`, `fix_applied`, `success`, `resolved_at`, `auto_resolved`)
SELECT
    id,
    'connection_limit',
    'medium',
    'Connection pool at 85% capacity (170/200). Consider scaling.',
    JSON_OBJECT(
            'cpu_percent', 45.0,
            'memory_percent', 55.0,
            'active_connections', 170,
            'max_connections', 200
    ),
    'resolved',
    'scale_connections',
    TRUE,
    NOW() - INTERVAL 2 HOUR,
    TRUE
FROM `databases` WHERE name = 'Orders';

-- Insert sample actions
INSERT INTO `agent_actions` (`incident_id`, `action_type`, `action_details`, `confidence_score`, `status`, `execution_time_ms`, `result_notes`)
SELECT
    i.id,
    'update_statistics',
    'ANALYZE TABLE users, user_sessions, user_preferences',
    85.5,
    'success',
    1250,
    'Table statistics updated successfully. Query optimizer now has fresh cardinality data.'
FROM `incidents` i
         JOIN `databases` d ON i.database_id = d.id
WHERE d.name = 'Users' AND i.status = 'open'
LIMIT 1;

-- Insert sample baseline pattern
INSERT INTO `baseline_patterns` (`database_id`, `pattern_name`, `pattern_type`, `time_period`, `pattern_data`, `sample_count`)
SELECT
    id,
    'business_hours',
    'hourly',
    '09:00-17:00',
    JSON_OBJECT(
            'avg_cpu', 45.0,
            'max_cpu', 75.0,
            'avg_memory', 55.0,
            'max_memory', 80.0,
            'avg_connections', 150,
            'max_connections', 180,
            'avg_qps', 1200,
            'description', 'Normal business hours pattern'
    ),
    500
FROM `databases` WHERE name = 'Orders';

INSERT INTO `baseline_patterns` (`database_id`, `pattern_name`, `pattern_type`, `time_period`, `pattern_data`, `sample_count`)
SELECT
    id,
    'off_hours',
    'hourly',
    '18:00-08:00',
    JSON_OBJECT(
            'avg_cpu', 15.0,
            'max_cpu', 30.0,
            'avg_memory', 35.0,
            'max_memory', 50.0,
            'avg_connections', 25,
            'max_connections', 50,
            'avg_qps', 200,
            'description', 'Off-hours/overnight pattern'
    ),
    500
FROM `databases` WHERE name = 'Orders';

-- Insert action history
INSERT INTO `action_history` (`database_id`, `action_type`, `description`, `executed_by`, `success`, `details`)
SELECT
    id,
    'scale_connections',
    'Increased max_connections from 200 to 250',
    'ai_agent',
    TRUE,
    JSON_OBJECT('old_value', 200, 'new_value', 250, 'reason', 'Connection pool approaching limit')
FROM `databases` WHERE name = 'Orders';

-- ============================================
-- VERIFY INSTALLATION
-- ============================================
SELECT '✅ Schema created successfully!' AS status;
SELECT CONCAT('📊 Databases: ', COUNT(*)) AS info FROM `databases`
UNION ALL
SELECT CONCAT('📈 Metrics: ', COUNT(*)) FROM `metrics`
UNION ALL
SELECT CONCAT('🚨 Incidents: ', COUNT(*)) FROM `incidents`
UNION ALL
SELECT CONCAT('⚡ Actions: ', COUNT(*)) FROM `agent_actions`
UNION ALL
SELECT CONCAT('📉 Baselines: ', COUNT(*)) FROM `baseline_patterns`;

-- Show database status
SELECT name, status, created_at FROM `databases`;