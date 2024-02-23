import { User } from './db'

export async function findOrCreateUser(userId, clientId, productId) {
  const orgId = `${clientId}-${productId}`;
  const [user, created] = await User.findOrCreate({ where: { user_id: userId, org_id: orgId } });
  return user && Object.assign(user, { metadata: { created } });
}

export const increaseUserUsedToken = async (user, amount) => {
  user.token_used = user.token_used + amount;
  await user.save();
};