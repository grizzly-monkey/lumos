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
-- Using BLOB to store vector data (compatible approach)
-- Gemini embedding-001 = 768 dimensions
-- Gemini text-embedding-004 = 1536 dimensions
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
    `symptoms_embedding`      BLOB COMMENT 'Vector embedding as binary (768 floats = 3072 bytes)',
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
    INDEX `idx_incidents_severity` (`severity`),
    INDEX `idx_incidents_timestamp` (`timestamp`),
    INDEX `idx_incidents_database` (`database_id`),
    FOREIGN KEY (`database_id`) REFERENCES `databases` (`id`) ON DELETE CASCADE
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
    INDEX `idx_actions_status` (`status`),
    INDEX `idx_actions_type` (`action_type`),
    INDEX `idx_actions_timestamp` (`timestamp`),
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
    INDEX `idx_baseline_database` (`database_id`),
    FOREIGN KEY (`database_id`) REFERENCES `databases` (`id`) ON DELETE CASCADE
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


SELECT
    id,
    VEC_DISTANCE_COSINE(symptoms_embedding, VECTOR(0.031149745,0.0029293408,-0.042048827,0.004554215,0.046004947,0.025396556,0.03001804,-0.01826149,0.03809593,0.02889219,-0.027788516,0.066585526,0.017654818,-0.039480094,-0.030100094,-0.04104521,0.055426884,-0.056668244,-0.04842334,-0.008098924,-0.042414833,-0.016351445,-0.029453654,-0.033697985,-0.020744886,-0.003996488,-0.028178642,-0.10005604,-0.026014507,-0.0024558601,0.025309624,0.0061299317,-0.011899889,-0.0478091,0.095126994,-0.014473152,-0.01901288,0.10113067,-0.010734029,-0.042369626,-0.029747931,-0.013403694,-0.032956313,0.043102775,0.044279896,0.004292002,0.037496116,-0.00020504699,0.01876061,0.010561961,0.050115503,-0.012765614,-0.02929917,0.017846951,-0.036211167,-0.052427225,-0.032652114,-0.033380706,0.037916657,0.018533206,0.035872046,-0.011082822,-0.04241414,0.02644576,-0.026070358,0.014319103,-0.049395017,-0.03282262,-0.051952872,-0.024145158,-0.055332255,-0.0198086,-0.014451352,-0.076940365,0.013887903,0.016935736,0.024267316,-0.03184594,-0.0170384,0.014884469,-0.015827212,-0.009416773,0.038028836,0.05773524,0.038972415,0.0031803013,0.063194886,0.003999129,-0.014500219,0.010949911,0.076931834,-0.04634775,-0.022451682,0.049554482,0.02991,-0.017882805,-0.11361707,-0.06267168,0.045619927,-0.002493178,-0.0067386497,-0.0032011154,-0.0019667284,-0.100700215,0.017276732,0.00981006,-0.04779518,-0.040563688,-0.055900544,0.027548384,0.013227823,-0.041219447,0.018457927,0.07207094,-0.013018316,-0.00874043,-0.03963661,0.014604506,0.049558092,-0.020668643,0.047216758,0.048459657,0.00032503423,-0.010909963,-0.02661942,0.045270182,-0.004127146,0.029926093,0.0061751455,0.03651745,-0.049605947,0.008661942,0.0023344532,0.016835324,0.024668429,0.017434483,0.03405836,0.044898897,-0.001660299,0.027410917,-0.00005299846,-0.071763694,-0.013291555,-0.014050052,0.005534723,-0.0035089105,0.027374385,0.013361455,0.037346072,0.04352069,-0.0339884,0.028296342,-0.0066597387,-0.038401164,0.015093944,-0.03271241,-0.024460763,-0.018203972,0.026285019,0.0023510423,-0.032076098,-0.006891479,-0.045822844,-0.022314152,-0.020491304,-0.023400633,-0.02951909,-0.014969544,-0.03998236,0.062385038,0.057365786,-0.039403792,0.0010863604,-0.06660486,-0.05386961,0.012681328,0.02254977,-0.014755469,-0.08121795,0.0012016481,0.05258268,-0.01313924,0.037103172,0.0033786008,0.011896395,0.0107143065,0.024020854,0.008811849,0.09617706,-0.02234485,0.008883184,0.018275635,0.03378809,-0.026573978,-0.0020571477,0.054853383,0.008499336,-0.03997249,-0.030540187,-0.049599998,0.081472315,-0.008001716,0.025447113,-0.018655809,-0.06013854,0.008499111,-0.027874269,-0.02588284,0.011471185,0.04714317,-0.030692097,-0.031530023,-0.030360565,-0.10673005,0.027251013,-0.028445667,-0.00045221028,0.01772377,-0.024392273,-0.01629126,0.02819915,-0.0061378316,0.035841238,0.056967158,0.0336087,-0.024960704,-0.04588418,0.032302905,0.030259224,-0.0032123828,0.024318593,-0.0057372567,-0.018654894,-0.034665104,-0.00092790456,0.07103525,0.0655235,0.052730467,0.030650802,0.04045302,-0.00081135315,0.026864475,0.04314081,0.0019967186,0.076074325,0.0147129595,0.09656737,0.062432397,-0.06305518,-0.07673702,-0.020086553,-0.07045738,0.013216027,0.045033325,-0.006237362,-0.0023402837,-0.008406747,0.022655757,0.011388086,-0.024526844,0.109169304,-0.02368364,-0.025202764,-0.0357798,-0.014798807,-0.06728404,-0.034695677,-0.027808484,-0.012495957,0.02210285,0.016146416,0.01225705,-0.027871246,0.040637724,-0.040665917,0.014316838,-0.041817997,0.0023507338,-0.0800186,0.011571773,-0.023282222,0.03167744,0.045134973,0.013599448,0.010190181,-0.038916055,0.00057022274,0.042061973,-0.042832196,-0.045199756,0.008853822,0.04839722,-0.03148529,-0.085176066,0.010463396,0.000397611,0.029082859,-0.013039256,0.04682405,-0.04064679,-0.0015057462,0.021751083,-0.017743334,0.05572066,0.020973364,0.014228235,0.036972545,-0.034622695,-0.023389047,0.025949854,0.03788581,-0.0038023514,-0.030196272,-0.006496282,-0.026065536,0.021643445,-0.04508466,-0.0047890516,-0.013284765,0.010254788,-0.023809196,0.0098115625,-0.05157658,0.04691077,-0.014068869,0.015478759,-0.0062637436,-0.034584332,-0.01455186,-0.014386794,0.07087805,-0.029738761,-0.022317808,0.020299463,-0.008856494,0.0381457,-0.05212219,0.009499422,0.046183035,0.032643147,-0.021795398,-0.014161125,0.005372694,0.009757427,-0.0273632,-0.05128265,0.01872184,-0.009543462,0.047314443,-0.044714164,0.024875084,-0.017069988,0.018932246,0.018986158,0.025243452,-0.0050285473,0.040756136,0.0049776756,0.045521088,-0.019185346,0.021106407,0.029111687,-0.045682427,0.08315042,0.013870285,0.006160283,0.015615507,0.06777406,-0.014150219,0.0148891555,-0.047763985,0.04326393,-0.019301616,-0.027076498,0.010933277,-0.045437217,0.007926688,-0.0077750892,0.027373897,-0.00521475,-0.014400058,0.0012369507,-0.047495455,0.02456711,-0.0023627377,0.0509645,-0.060815644,0.0032312165,0.025041517,0.01842434,-0.03276572,0.004764003,-0.053971622,0.03173808,-0.05997582,0.039561696,-0.039940953,0.023916522,-0.024565468,0.06377542,0.012714419,0.0032623666,0.061819546,-0.037216976,0.024314502,0.01836901,0.030627439,0.06435248,0.044123504,0.005136031,-0.015650334,-0.043535672,-0.0006984737,-0.042828657,-0.03181528,0.0035043785,0.023048783,-0.0014207583,0.02879215,0.020307565,-0.022122832,0.016686993,0.009266106,-0.017526941,-0.031073157,-0.017055541,-0.05867918,0.04151391,0.0010395343,0.045733232,0.0023754411,0.06930861,-0.066465326,0.018721147,-0.08349299,-0.020019576,0.024497557,-0.0049681664,0.032655805,0.022481611,-0.029360682,0.079017304,0.01728543,0.032474384,0.012673989,-0.0046613934,0.048419964,0.0019968566,-0.02960261,-0.05689045,-0.034143664,-0.030873647,-0.013282824,-0.030870598,-0.01601311,0.0021326297,0.0005104528,0.020599505,-0.016001953,0.04216612,0.014679343,0.01656612,0.05769064,0.010129906,-0.09113996,-0.027529374,0.066952504,0.01035421,-0.024061348,0.028353702,-0.00035959927,-0.015224175,0.011855079,-0.0013002082,-0.038388886,-0.025542537,0.066138275,-0.005844739,-0.06085898,-0.029431347,0.012925394,0.016865937,-0.033712074,0.076883204,0.028308086,0.0063079367,-0.03615139,0.016829485,0.032976184,0.056577206,0.012261865,0.033515107,-0.044797152,-0.0069600185,0.050548997,0.022066534,-0.0016042723,-0.013555195,0.0059095235,0.042799264,0.07071444,0.017260274,0.09259561,-0.0049240845,-0.026582306,-0.010909311,-0.047074277,0.02495263,0.040214207,0.0035820513,0.10299329,0.056029852,0.025516994,0.014770017,-0.004839782,0.01051057,-0.009145944,-0.015179928,-0.008061529,-0.029196888,0.058626845,-0.046483945,0.0787822,-0.06721747,0.0033494635,-0.036184642,-0.042486694,-0.04805051,-0.027972564,0.014860636,0.041469116,0.030054135,0.02474083,0.040771797,0.0471628,0.03391684,0.05147116,0.052425575,0.0074102697,0.018310742,0.016078094,-0.0156318,0.034672543,0.044719744,0.027632875,0.012437889,0.04636679,-0.00801112,-0.028930033,0.008760271,-0.058215626,-0.07204604,-0.027417377,-0.015405251,0.008925354,0.030079661,0.07039735,-0.02292519,-0.05291894,0.025376251,0.029533142,-0.022355778,0.03662063,0.038432818,0.05181283,0.0061909277,-0.019869758,0.018585417,0.0128396135,-0.008373116,-0.054831643,-0.018445838,0.049897674,-0.01306576,0.016595652,0.056655243,0.0043501733,-0.011264755,0.0004914536,0.01982467,-0.016973956,-0.01641803,0.023768619,-0.037437066,-0.034951277,-0.019863732,0.04217182,-0.0013144945,-0.008105827,0.03441092,-0.036138482,-0.025860969,0.031590533,-0.0067967772,0.053632114,0.010118508,-0.0377954,0.04239331,-0.023235926,-0.012684099,0.06552763,0.0019815578,0.0077387206,0.017773686,-0.033749152,-0.023924356,0.009168888,-0.060904704,0.065914854,-0.0063462816,0.049418386,0.010631705,0.012529137,-0.06390349,-0.061114095,0.012013084,-0.024775406,-0.0027965398,0.02700862,-0.006446499,-0.017648524,-0.0072909407,0.006872614,-0.043975156,-0.0362045,-0.0097820405,-0.013232713,0.024590963,0.037704438,0.020593744,-0.0516344,0.047228605,0.08074583,-0.035056185,-0.04379485,0.021956382,-0.010069611,-0.02531117,-0.009895263,-0.044798587,0.030576633,0.045650944,0.03153262,0.011902589,-0.06968143,-0.031357314,0.03817869,-0.027355265,0.0014862053,0.07803066,-0.03937368,0.0558614,-0.05353521,0.02132241,-0.037057318,-0.030676315,-0.0031793083,0.04876529,-0.002557219,-0.0068760924,0.049408633,-0.0627622,0.03463106,0.04865021,0.04718913,-0.031444985,-0.008951433,0.0045496225,0.00078936294,-0.018845173,0.057459485,0.029476408,-0.016358454,0.044352476,0.0042106584,0.033735353,0.02670329,0.020966575,-0.031899635,0.025978148,0.0041087335,-0.042956226,-0.018619664,0.013921334,0.015887879,0.007084721,-0.010510455,-0.02241894,0.030900216,0.029190788,0.0035566937,-0.0073981904,0.023360252,0.026665723,0.015550876,0.048275404,-0.017377082,-0.009458513,-0.057990145,-0.010349634,-0.0071416707,0.0022996026,-0.013264137,-0.0362484,0.008883375,-0.004095316,0.01617757,-0.014221799,0.0072279517,-0.013026712,-0.062394258,0.035698347,0.07199136,-0.0037918321,0.0050429543,0.016462186,-0.00044523954,0.04947878,-0.047257595,-0.02162837,0.007395914,0.002350098,0.007640555,0.01944788,0.081393026,0.022809157,0.014221891,0.015424481,0.0013954951,0.026558312,0.020853544,0.056661688,-0.015062807,0.013351424,0.008892908,-0.058447164,0.031477876,-0.033626813,0.075144105,-0.017944174,0.016334705,0.0060896995,-0.015036504,-0.00042034758,-0.065363,0.058970395,0.0356786,0.031833276,-0.038991693,-0.042905938,-0.1204725,-0.006959708,0.05839691,-0.0048891073,-0.032500837,-0.018982595,0.02347533,0.017891442,0.030020792,0.019727055,-0.0156978,0.028257765,-0.022973878,-0.017151708,-0.043125335,-0.015932346,0.04434304,0.011136829)) AS score
FROM incidents
WHERE status = 'resolved'
  AND id != 11
ORDER BY score ASC
LIMIT 5;


select version();
SELECT
    id,
    VEC_DISTANCE_COSINE(
            symptoms_embedding,
            VEC_FROM_TEXT('[0.031149745, 0.0029293408]')
    ) AS score
FROM incidents
WHERE status = 'resolved'
  AND id != 11
ORDER BY score ASC
LIMIT 5;

SELECT
    id,
    VEC_DISTANCE_COSINE(
            symptoms_embedding,
            CAST('[0.031149745,0.0029293408]' AS VECTOR)
    ) AS score
FROM incidents
WHERE status = 'resolved'
  AND id != 11
ORDER BY score ASC
LIMIT 5;


CREATE TABLE vector_test (
                             id INT PRIMARY KEY AUTO_INCREMENT,
                             embedding VECTOR(2)
);

INSERT INTO vector_test (embedding)
VALUES
    (CAST('[0.1, 0.2]' AS VECTOR)),
    (CAST('[0.2, 0.1]' AS VECTOR)),
    (CAST('[0.9, 0.8]' AS VECTOR));