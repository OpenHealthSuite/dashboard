-- Copy token.expires_in to expires_in
UPDATE user_service_token
SET expires_in = (raw_token ->> 'expires_in')::integer;