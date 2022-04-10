DROP TABLE IF EXISTS user_service_token;
DROP TABLE IF EXISTS user_setting;

CREATE TABLE user_service_token (
  service_id varchar(40) NOT NULL,
  paceme_user_id varchar(40) NOT NULL,
  raw_token json,
  expires_in integer,
  last_updated timestamp
);

CREATE TABLE user_setting (
  setting_id varchar(40) NOT NULL,
  user_id varchar(40) NOT NULL,
  details json
);