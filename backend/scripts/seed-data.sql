-- SQL script to seed the NightWatch database with a rich set of demo data.
-- This provides the necessary historical context for the AI agent and populates the dashboard.

USE nightwatch_db;

-- 1. Seed Monitored Databases
-- Using INSERT IGNORE to prevent errors if the data already exists.
INSERT IGNORE INTO `databases` (`id`, `name`, `status`) VALUES
(1, 'OrdersDB', 'healthy'),
(2, 'UsersDB', 'critical'), -- Set to critical to match the open incident below
(3, 'ProductsDB', 'healthy'),
(4, 'AnalyticsDB', 'warning'),
(5, 'InventoryDB', 'healthy');

-- 2. Seed a variety of Resolved Incidents for the AI to learn from.
INSERT IGNORE INTO `incidents` (`id`, `database_id`, `issue_type`, `severity`, `symptoms`, `status`, `resolved_at`, `resolution_notes`) VALUES
(
  1, 1, 'high_cpu_usage', 'high',
  'High CPU utilization detected, reaching 95%. Analysis points to a SELECT query on the `orders` table without a proper index on `customer_id`.',
  'resolved', NOW() - INTERVAL 2 DAY,
  'Resolved by adding a new index to the `orders` table on the `customer_id` column.'
),
(
  2, 3, 'slow_query', 'medium',
  'A specific query joining `products` and `reviews` tables is taking over 5 seconds to execute, impacting product page load times.',
  'resolved', NOW() - INTERVAL 1 DAY,
  'The query plan showed a full table scan. The `rebuild_index` action was performed on the primary index of the `reviews` table, which resolved the issue.'
),
(
  3, 4, 'connection_spike', 'high',
  'The number of active connections spiked to 98% of the `max_connections` limit, causing connection refusal errors for new clients.',
  'resolved', NOW() - INTERVAL 5 DAY,
  'Temporarily increased `max_connections` from 100 to 150 to handle the load. The spike was transient and related to a marketing campaign.'
);

-- 3. Seed a currently OPEN and CRITICAL incident for the agent to solve.
INSERT IGNORE INTO `incidents` (`id`, `database_id`, `issue_type`, `severity`, `symptoms`, `status`) VALUES
(
  4, 2, 'high_cpu_usage', 'critical',
  'CPU utilization has been stuck at over 98% for the last 15 minutes on UsersDB. Multiple long-running SELECT statements on the `users` table are observed, specifically filtering by the `email` column which is not indexed.',
  'open'
);


-- 4. Seed corresponding successful agent actions for the resolved incidents.
INSERT IGNORE INTO `agent_actions` (`id`, `incident_id`, `action_type`, `action_details`, `confidence_score`, `status`, `result_notes`) VALUES
(
  1, 1, 'create_index',
  'AI model determined with 95% confidence that a missing index on `orders(customer_id)` was the root cause.',
  95.5, 'success', 'Index `idx_customer_id` was created. CPU usage returned to normal.'
),
(
  2, 2, 'rebuild_index',
  'Based on query execution plan analysis, the AI suggested rebuilding the index to reduce fragmentation.',
  88.0, 'success', 'Index on `reviews` table was rebuilt. Average query time dropped by 80%.'
),
(
  3, 3, 'scale_connections',
  'AI detected that the connection limit was the bottleneck and recommended a temporary increase.',
  92.0, 'success', 'Increased `max_connections` successfully. Connection errors ceased.'
);

-- 5. Seed a rich set of historical and current metrics.
-- Note the metrics for database_id = 2, which correspond to the open incident.
INSERT IGNORE INTO `metrics` (`database_id`, `timestamp`, `cpu_percent`, `memory_percent`, `active_connections`, `slow_queries_count`, `disk_usage_percent`, `queries_per_second`, `avg_query_time_ms`) VALUES
-- Healthy metrics for OrdersDB (ID 1)
(1, NOW() - INTERVAL 30 MINUTE, 15.5, 45.2, 50, 0, 60.1, 1200, 50),
(1, NOW() - INTERVAL 20 MINUTE, 14.2, 45.5, 55, 0, 60.1, 1250, 48),
(1, NOW() - INTERVAL 10 MINUTE, 16.1, 46.0, 60, 0, 60.2, 1300, 52),
(1, NOW(), 15.8, 45.9, 58, 0, 60.2, 1280, 51),

-- Anomalous metrics for UsersDB (ID 2) leading to the open incident
(2, NOW() - INTERVAL 30 MINUTE, 40.0, 65.0, 80, 2, 75.0, 700, 250),
(2, NOW() - INTERVAL 20 MINUTE, 75.0, 68.0, 95, 8, 75.1, 650, 500),
(2, NOW() - INTERVAL 10 MINUTE, 98.2, 70.0, 110, 15, 75.1, 600, 1200),
(2, NOW(), 99.1, 71.0, 125, 22, 75.2, 550, 1800),

-- Healthy metrics for ProductsDB (ID 3)
(3, NOW() - INTERVAL 10 MINUTE, 20.5, 60.1, 250, 0, 40.0, 2500, 80),
(3, NOW(), 21.0, 60.3, 255, 0, 40.0, 2600, 78),

-- Warning metrics for AnalyticsDB (ID 4)
(4, NOW() - INTERVAL 10 MINUTE, 50.0, 85.0, 30, 5, 88.0, 100, 300),
(4, NOW(), 52.3, 85.4, 28, 6, 88.1, 95, 310);


-- 6. Seed a baseline pattern for a healthy database.
-- The AI can use this to differentiate between normal and anomalous behavior.
INSERT IGNORE INTO `baseline_patterns` (`database_id`, `pattern_name`, `pattern_data`) VALUES
(
  1,
  'weekday_peak_hours',
  '{"description": "Normal traffic pattern for OrdersDB during business hours on a weekday.", "metrics": {"avg_cpu_percent": [15, 30], "max_active_connections": 150, "allowable_slow_queries": 1}}'
);


SELECT '✅ Rich demo data has been seeded into the database.' AS status;
