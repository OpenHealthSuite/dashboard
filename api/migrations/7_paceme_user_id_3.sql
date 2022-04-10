-- postgres-migrations disable-transaction
ALTER TABLE user_service_token
DROP COLUMN user_id;