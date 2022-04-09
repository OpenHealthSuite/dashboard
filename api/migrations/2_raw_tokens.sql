

-- Add column raw_token json
ALTER TABLE user_service_token
ADD COLUMN raw_token json;
-- Add column last_updated Date
ALTER TABLE user_service_token
ADD COLUMN last_updated timestamp;

-- Copy token to raw_token
UPDATE user_service_token
SET raw_token = token;

-- Copy token.date_retrieved to last_updated
-- 2022-04-08T22:23:47.674Z
UPDATE user_service_token
SET last_updated = (token ->> 'date_retrieved')::timestamp;

ALTER TABLE user_service_token ALTER COLUMN last_updated SET NOT NULL;
ALTER TABLE user_service_token ALTER COLUMN raw_token SET NOT NULL;

ALTER TABLE user_service_token
DROP COLUMN token;