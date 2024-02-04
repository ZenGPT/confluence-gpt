CREATE TABLE gpt_dock_client_data (
    client_id VARCHAR NOT NULL,
    product_id VARCHAR NOT NULL,
    _updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (now() at time zone 'utc'),
    max_quota INTEGER NOT NULL DEFAULT 500000,
    token_quota INTEGER NOT NULL DEFAULT 500000,
    version BIGINT NOT NULL,
    PRIMARY KEY (client_id, product_id)
);
