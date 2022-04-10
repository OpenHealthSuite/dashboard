-- postgres-migrations disable-transaction
ALTER TABLE user_service_token
DROP COLUMN IF EXISTS paceme_user_id;

ALTER TABLE user_service_token
ADD COLUMN paceme_user_id varchar(40);