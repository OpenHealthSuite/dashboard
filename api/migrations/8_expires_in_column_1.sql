
-- postgres-migrations disable-transaction
ALTER TABLE user_service_token
DROP COLUMN IF EXISTS expires_in;

ALTER TABLE user_service_token
ADD COLUMN expires_in integer;
