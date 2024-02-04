CREATE TABLE gpt_dock_user_data (
    user_id VARCHAR NOT NULL,
    org_id VARCHAR NOT NULL, -- 格式为 client_id-product_id
    _updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (now() at time zone 'utc'),
    token_used INTEGER NOT NULL DEFAULT 0,
    version BIGINT NOT NULL,
    PRIMARY KEY (user_id, org_id)
);
