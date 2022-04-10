ALTER TABLE user_service_token ALTER COLUMN last_updated SET NOT NULL;
ALTER TABLE user_service_token ALTER COLUMN raw_token SET NOT NULL;

ALTER TABLE user_service_token
DROP COLUMN token;