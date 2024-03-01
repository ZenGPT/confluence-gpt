import { Diagram } from './db'

export async function findOrCreateDiagram(
  clientId,
  productId,
  dslCode,
  contentId,
  creatorId
) {
  const orgId = `${clientId}-${productId}`;
  const diagram = await Diagram.findOne({
    where: { org_id: orgId, content_id: contentId },
  });
  if (!diagram) {
    return await Diagram.create({
      org_id: orgId,
      content_id: contentId,
      dsl_code: dslCode,
      creator_id: creatorId
    });
  } else {
    return diagram;
  }
}
