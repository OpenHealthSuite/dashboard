

-- Add column expires in json
ALTER TABLE user_service_token
ADD COLUMN expires_in integer;

-- Copy token.expires_in to expires_in
UPDATE user_service_token
SET expires_in = (raw_token ->> 'expires_in')::integer;