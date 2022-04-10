-- postgres-migrations disable-transaction

-- Add column raw_token json
ALTER TABLE user_service_token
ADD COLUMN raw_token json;
-- Add column last_updated Date
ALTER TABLE user_service_token
ADD COLUMN last_updated timestamp;
