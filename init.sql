-- Create database
SELECT 'CREATE DATABASE course_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'course_user')\gexec

-- Connect to new database
\c course_user

-- Create user with privileges
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'course_user') THEN
    CREATE ROLE course_user WITH LOGIN PASSWORD 'course_user';
    RAISE NOTICE 'User course_user created';
  ELSE
    ALTER ROLE course_user WITH PASSWORD 'course_user';
    RAISE NOTICE 'User course_user already exists, password updated';
  END IF;
END $$;

-- Grant privileges
GRANT CONNECT ON DATABASE course_user TO course_user;
GRANT CREATE ON DATABASE course_user TO course_user;
GRANT USAGE, CREATE ON SCHEMA public TO course_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO course_user;
GRANT SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO course_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO course_user;

-- Default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO course_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT, UPDATE ON SEQUENCES TO course_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT EXECUTE ON FUNCTIONS TO course_user;

DO $$
BEGIN
  RAISE NOTICE 'All privileges granted to course_user';
END $$;