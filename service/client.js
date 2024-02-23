import { Client } from './db'
import { findOrCreateUser, increaseUserUsedToken } from './user'

const DEFAULT_TOKEN_QUOTA = 500000;

export async function findOrCreateClient(clientId, productId) {
  const [client, created] = await Client.findOrCreate({
    where: {client_id: clientId, product_id: productId},
    defaults: {max_quota: DEFAULT_TOKEN_QUOTA, token_quota: DEFAULT_TOKEN_QUOTA, version: 1}
  });
  return client && Object.assign(client, {metadata: {created}});
}

export async function clientRunOutOfToken(clientId, productId) {
  const client = await findOrCreateClient(clientId, productId);
  return client.token_quota <= 0;
};

export async function deductClientToken(userId, clientId, productId, tokenUsage) {
  const client = await findOrCreateClient(clientId, productId);
  client.token_quota = client.token_quota - tokenUsage;
  await client.save();

  const user = await findOrCreateUser(userId, clientId, productId);
  await increaseUserUsedToken(user, tokenUsage);
};