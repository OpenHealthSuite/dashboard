-- Copy token to raw_token
UPDATE user_service_token
SET raw_token = token;

-- Copy token.date_retrieved to last_updated
-- 2022-04-08T22:23:47.674Z
UPDATE user_service_token
SET last_updated = (token ->> 'date_retrieved')::timestamp;
