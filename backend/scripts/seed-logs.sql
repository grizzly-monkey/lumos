-- ============================================
-- SEED LOG DATA FOR NIGHTWATCH
-- Creates a simulation of MariaDB system logs
-- ============================================

USE nightwatch_db;

-- 1. Create a table to simulate the system log
-- In a real scenario, we might query mysql.general_log directly,
-- but for this demo, we'll use a local table to store actionable log events.
CREATE TABLE IF NOT EXISTS `db_logs` (
  `event_time` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `user_host` MEDIUMTEXT NOT NULL,
  `thread_id` BIGINT(21) UNSIGNED NOT NULL,
  `server_id` INT(10) UNSIGNED NOT NULL,
  `command_type` VARCHAR(64) NOT NULL,
  `argument` MEDIUMTEXT NOT NULL,
  `database_id` INT NOT NULL, -- Link to our monitored databases
  INDEX `idx_event_time` (`event_time`),
  FOREIGN KEY (`database_id`) REFERENCES `databases`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Simulation of MariaDB general/slow query log';

-- 2. Seed Actionable Log Entries

-- SCENARIO 1: Slow Query on OrdersDB (Database ID 1)
-- Actionable: Needs Indexing
INSERT INTO `db_logs` (`event_time`, `user_host`, `thread_id`, `server_id`, `command_type`, `argument`, `database_id`)
VALUES
(NOW(), 'app_user[app_user] @ localhost []', 101, 1, 'Query',
 'SELECT * FROM orders WHERE customer_email = "john.doe@example.com" ORDER BY created_at DESC; -- Duration: 12.500 sec',
 1);

-- SCENARIO 2: Deadlock on ProductsDB (Database ID 3)
-- Actionable: Deadlock analysis
INSERT INTO `db_logs` (`event_time`, `user_host`, `thread_id`, `server_id`, `command_type`, `argument`, `database_id`)
VALUES
(NOW() - INTERVAL 5 MINUTE, 'web_client[web_client] @ 192.168.1.50 []', 205, 1, 'Error',
 'Deadlock found when trying to get lock; try restarting transaction',
 3);

-- SCENARIO 3: Connection Limit Reached on UsersDB (Database ID 2)
-- Actionable: Scale Connections
INSERT INTO `db_logs` (`event_time`, `user_host`, `thread_id`, `server_id`, `command_type`, `argument`, `database_id`)
VALUES
(NOW() - INTERVAL 10 MINUTE, 'auth_service[auth_service] @ 10.0.0.5 []', 0, 1, 'Error',
 'Too many connections',
 2);

-- SCENARIO 4: Disk Full / Table Full on AnalyticsDB (Database ID 4)
-- Actionable: Clear Logs / Add Storage
INSERT INTO `db_logs` (`event_time`, `user_host`, `thread_id`, `server_id`, `command_type`, `argument`, `database_id`)
VALUES
(NOW() - INTERVAL 15 MINUTE, 'batch_job[batch_job] @ localhost []', 303, 1, 'Error',
 'The table "daily_stats" is full',
 4);

-- SCENARIO 5: Access Denied (Security Warning) on OrdersDB
-- Actionable: Security Audit
INSERT INTO `db_logs` (`event_time`, `user_host`, `thread_id`, `server_id`, `command_type`, `argument`, `database_id`)
VALUES
(NOW() - INTERVAL 1 HOUR, 'unknown_user[unknown] @ 192.168.1.200 []', 404, 1, 'Connect',
 'Access denied for user "root"@"192.168.1.200" (using password: YES)',
 1);

SELECT '✅ Log simulation table created and seeded with actionable events.' AS status;
