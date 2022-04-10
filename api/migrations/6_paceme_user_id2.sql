UPDATE user_service_token
SET paceme_user_id = user_id;

ALTER TABLE user_service_token ALTER COLUMN paceme_user_id SET NOT NULL;
