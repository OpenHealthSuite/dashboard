-- postgres-migrations disable-transaction
ALTER TABLE user_service_token
DROP COLUMN IF EXISTS raw_token;
ALTER TABLE user_service_token
DROP COLUMN IF EXISTS last_updated;

-- Add column raw_token json
ALTER TABLE user_service_token
ADD COLUMN raw_token json;
-- Add column last_updated Date
ALTER TABLE user_service_token
ADD COLUMN last_updated timestamp;
