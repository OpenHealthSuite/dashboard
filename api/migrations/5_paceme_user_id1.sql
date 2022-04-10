-- postgres-migrations disable-transaction
ALTER TABLE user_service_token
ADD COLUMN paceme_user_id varchar(40);