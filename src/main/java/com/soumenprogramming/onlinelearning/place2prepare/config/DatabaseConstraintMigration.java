package com.soumenprogramming.onlinelearning.place2prepare.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseConstraintMigration implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseConstraintMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
        jdbcTemplate.execute(
                "ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('STUDENT','ADMIN'))"
        );
        jdbcTemplate.execute("ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS plan_type VARCHAR(30) DEFAULT 'BASIC'");
        jdbcTemplate.execute("UPDATE enrollments SET plan_type = 'BASIC' WHERE plan_type IS NULL");
        jdbcTemplate.execute("ALTER TABLE enrollments ALTER COLUMN plan_type SET NOT NULL");
        jdbcTemplate.execute("ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS updated_by VARCHAR(150) DEFAULT 'SYSTEM'");
        jdbcTemplate.execute("UPDATE activity_logs SET updated_by = 'SYSTEM' WHERE updated_by IS NULL OR updated_by = ''");
        jdbcTemplate.execute("ALTER TABLE activity_logs ALTER COLUMN updated_by SET NOT NULL");
        jdbcTemplate.execute("ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE");
        jdbcTemplate.execute("UPDATE courses SET is_premium = FALSE WHERE is_premium IS NULL");

        jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS account_premium BOOLEAN DEFAULT FALSE");
        jdbcTemplate.execute("UPDATE users SET account_premium = FALSE WHERE account_premium IS NULL");
        jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN account_premium SET NOT NULL");

        jdbcTemplate.execute("ALTER TABLE live_sessions ADD COLUMN IF NOT EXISTS course_id BIGINT");
        jdbcTemplate.execute("ALTER TABLE live_sessions ADD COLUMN IF NOT EXISTS description VARCHAR(2000)");
        jdbcTemplate.execute("ALTER TABLE live_sessions ADD COLUMN IF NOT EXISTS instructor_name VARCHAR(200)");
        jdbcTemplate.execute("ALTER TABLE live_sessions ADD COLUMN IF NOT EXISTS join_url VARCHAR(500)");
        jdbcTemplate.execute("ALTER TABLE live_sessions ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60");
        jdbcTemplate.execute("UPDATE live_sessions SET duration_minutes = 60 WHERE duration_minutes IS NULL");
        jdbcTemplate.execute("ALTER TABLE live_sessions ALTER COLUMN duration_minutes SET NOT NULL");
        jdbcTemplate.execute("ALTER TABLE live_sessions ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'SCHEDULED'");
        jdbcTemplate.execute("UPDATE live_sessions SET status = 'SCHEDULED' WHERE status IS NULL");
        jdbcTemplate.execute("ALTER TABLE live_sessions ALTER COLUMN status SET NOT NULL");
        jdbcTemplate.execute("ALTER TABLE live_sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE");
        jdbcTemplate.execute("UPDATE live_sessions SET created_at = COALESCE(created_at, now())");
        jdbcTemplate.execute("ALTER TABLE live_sessions ALTER COLUMN created_at SET NOT NULL");
        jdbcTemplate.execute("ALTER TABLE live_sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE");
        jdbcTemplate.execute("UPDATE live_sessions SET updated_at = COALESCE(updated_at, now())");
        jdbcTemplate.execute("ALTER TABLE live_sessions ALTER COLUMN updated_at SET NOT NULL");
    }
}
