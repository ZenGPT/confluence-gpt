import { Pool } from 'pg';

const DEFAULT_TOKEN_QUOTA = 500000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initClient = async (clientId, productId) => {
  const query = `
    INSERT INTO gpt_dock_client_data (client_id, product_id, token_quota, max_quota, _updated_at, version)
    VALUES ($1, $2, ${DEFAULT_TOKEN_QUOTA}, ${DEFAULT_TOKEN_QUOTA}, NOW(), 1)
    ON CONFLICT (client_id, product_id) 
    DO NOTHING;
  `;
  const values = [clientId, productId];
  await pool.query(query, values);
};

const initUser = async (userId, clientId, productId) => {
  const query = `
    INSERT INTO gpt_dock_user_data (user_id, org_id, _updated_at, token_used, version)
    VALUES ($1, $2, NOW(), 0, 1)
    ON CONFLICT (user_id, org_id) 
    DO NOTHING;
  `;
  const orgId = `${clientId}-${productId}`;
  const values = [userId, orgId];
  await pool.query(query, values);
};

const checkClient = async (clientId, productId) => {
  const query = `
    SELECT * FROM gpt_dock_client_data 
    WHERE client_id = $1 AND product_id = $2;
  `;
  const values = [clientId, productId];
  const res = await pool.query(query, values);
  return res.rows[0];
};

const checkUser = async (userId, orgId) => {
  const query = `
        SELECT * FROM gpt_dock_user_data 
        WHERE user_id = $1 AND org_id = $2;
    `;
  const values = [userId, orgId];
  const res = await pool.query(query, values);
  return res.rows[0];
};

const getOrInitClient = async (clientId, productId) => {
  let client = await checkClient(clientId, productId);
  if (!client) {
    await initClient(clientId, productId);
    client = await checkClient(clientId, productId);
  }
  return client;
};

const getOrInitUser = async (userId, clientId, productId) => {
  const orgId = `${clientId}-${productId}`;
  let user = await checkUser(userId, orgId);
  if (!user) {
    await initUser(userId, clientId, productId);
    user = await checkUser(userId, orgId);
  }
  return user;
};

const getUsersCount = async () => {
  const query = `SELECT COUNT(*) FROM gpt_dock_user_data;`;
  const res = await pool.query(query);
  return parseInt(res.rows[0].count, 10);
};

const deductClientToken = async (clientId, productId, amount) => {
  await getOrInitClient(clientId, productId); // ensure client exists
  const query = `
    UPDATE gpt_dock_client_data 
    SET token_quota = token_quota - $3
    WHERE client_id = $1 AND product_id = $2;
  `;
  const values = [clientId, productId, amount];
  await pool.query(query, values);
};

const increaseUserTokenUsed = async (userId, clientId, productId, amount) => {
  await getOrInitUser(userId, clientId, productId); // ensure user exists
  const query = `
    UPDATE gpt_dock_user_data 
    SET token_used = token_used + $3
    WHERE user_id = $1 AND org_id = $2;
  `;
  const orgId = `${clientId}-${productId}`;
  const values = [userId, orgId, amount];
  await pool.query(query, values);
};

export default {
  initClient,
  initUser,
  checkClient,
  checkUser,
  getOrInitClient,
  getOrInitUser,
  getUsersCount,
  deductClientToken,
  increaseUserTokenUsed,
};
