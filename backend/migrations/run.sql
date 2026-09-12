-- Executed by psql in one transaction; serialize concurrent migration runs.
SELECT pg_advisory_xact_lock(714205931);

CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

SELECT NOT EXISTS (
    SELECT 1 FROM schema_migrations WHERE version = '001_initial_schema'
) AS apply_initial_schema \gset

\if :apply_initial_schema
    \ir mirations.sql
    INSERT INTO schema_migrations (version) VALUES ('001_initial_schema');
\else
    \echo '001_initial_schema already applied; skipping.'
\endif
