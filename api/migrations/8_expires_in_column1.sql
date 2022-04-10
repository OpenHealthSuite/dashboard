
-- postgres-migrations disable-transaction
-- Add column expires in json
ALTER TABLE user_service_token
ADD COLUMN expires_in integer;
