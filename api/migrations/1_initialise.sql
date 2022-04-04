DROP TABLE IF EXISTS user_service_token;
DROP TABLE IF EXISTS user_setting;

CREATE TABLE user_service_token (
  service_id varchar(40) NOT NULL,
  user_id varchar(40) NOT NULL,
  token json
);

CREATE TABLE user_setting (
  setting_id varchar(40) NOT NULL,
  user_id varchar(40) NOT NULL,
  details json
);