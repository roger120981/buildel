import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';
import type { z } from 'zod';

import type { MemoryNodeRelated } from '~/api/knowledgeBase/knowledgeApi.contracts';
import { KnowledgeBaseApi } from '~/api/knowledgeBase/KnowledgeBaseApi';
import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, 'organizationId not found');
    invariant(params.collectionName, 'collectionName not found');

    const knowledgeBaseApi = new KnowledgeBaseApi(fetch);

    const {
      data: { id: collectionId },
    } = await knowledgeBaseApi.getCollectionByName(
      params.organizationId,
      params.collectionName,
    );

    const graph = await knowledgeBaseApi.getCollectionGraph(
      params.organizationId,
      collectionId,
    );
    const graphState = await knowledgeBaseApi.getCollectionGraphState(
      params.organizationId,
      collectionId,
    );

    const url = new URL(request.url);
    const chunk_id = url.searchParams.get('chunk_id');

    const activeChunk =
      graph.data.nodes.find((node) => node.id === chunk_id) ?? null;

    let relatedNeighbours: z.TypeOf<typeof MemoryNodeRelated>['chunks'] = [];

    if (activeChunk) {
      const { data } = await knowledgeBaseApi.getRelatedNeighbours(
        params.organizationId,
        collectionId,
        activeChunk.id,
      );

      relatedNeighbours = data.chunks;
    }

    return json({
      organizationId: params.organizationId,
      collectionName: params.collectionName,
      collectionId: collectionId,
      graph: graph.data,
      graphState: graphState.data,
      activeChunk,
      relatedNeighbours,
    });
  })(args);
}
