import React, { useCallback, useEffect } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Outlet, useLoaderData, useMatch, useNavigate } from '@remix-run/react';
import type { OnSelectionChangeParams } from '@xyflow/react';
import { Background, ReactFlow, useNodesState } from '@xyflow/react';
import isEqual from 'lodash.isequal';

import { useRevalidateOnInterval } from '~/hooks/useRevalidateOnInterval';

import { ActiveNodeProvider } from './activeNodeProvider';
import type { IEmbeddingNode } from './collectionGraph.types';
import {
  generateActiveNodeEdges,
  toEmbeddingNodes,
} from './collectionGraph.utils';
import { EmbeddingNode } from './components/EmbeddingNode';
import { GenerateGraph } from './components/GenerateGraph';
import {
  NodePreviewSidebar,
  NodePreviewSidebarContent,
  NodePreviewSidebarHeader,
} from './components/NodePreviewSidebar';
import type { loader } from './loader.server';

import '@xyflow/react/dist/style.css';

import { routes } from '~/utils/routes.utils';

import { ChunksSearch } from './components/ChunksSearch';

const customNodes = {
  embedding: EmbeddingNode,
};

export function KnowledgeBaseGraphPage() {
  const navigate = useNavigate();
  const {
    graph,
    graphState,
    searchChunks,
    collectionName,
    organizationId,
    activeChunk,
    relatedNeighbours,
    prevNode,
    nextNode,
    query,
  } = useLoaderData<typeof loader>();

  const [nodes, setNodes, onNodesChange] = useNodesState<IEmbeddingNode>(
    toEmbeddingNodes(graph.nodes),
  );

  const matchDetails = useMatch(
    '/:organization_id/knowledge-base/:collection_name/graph/details',
  );
  const isNewSidebarOpen = !!matchDetails;

  const closeSidebar = () => {
    navigate(routes.collectionGraph(organizationId, collectionName, { query }));
  };

  useRevalidateOnInterval({ enabled: graphState.state !== 'idle' });

  const onSelectionChange = useCallback(
    (params: OnSelectionChangeParams) => {
      if (params.nodes.length === 0) return;
      const node = params.nodes[0] as IEmbeddingNode;
      navigate(
        routes.collectionGraphDetails(organizationId, collectionName, {
          chunk_id: node.id,
          query,
        }),
      );
    },
    [query],
  );

  useEffect(() => {
    const updated = toEmbeddingNodes(graph.nodes);
    if (isEqual(nodes, updated)) return;

    setNodes(updated);
  }, [graph]);

  return (
    <ActiveNodeProvider
      value={{
        searchChunks,
        prevNode,
        nextNode,
        activeNode: activeChunk,
        relatedNeighbours: relatedNeighbours,
      }}
    >
      <div className="h-[calc(100vh_-_170px_-_34px_)] w-full relative lg:-top-3 overflow-hidden">
        <div className="flex justify-between items-center gap-6 absolute top-4 right-4 left-4 z-[12] md:right-6 md:left-4 lg:right-10 lg:left-10 pointer-events-none bg-transparent">
          <ChunksSearch defaultValue={query} />

          <GenerateGraph state={graphState} />
        </div>

        <NodePreviewSidebar
          isOpen={isNewSidebarOpen}
          onOpenChange={closeSidebar}
        >
          <NodePreviewSidebarHeader>
            <h3 className="font-semibold">Node Properties</h3>
          </NodePreviewSidebarHeader>
          <NodePreviewSidebarContent>
            <Outlet />
          </NodePreviewSidebarContent>
        </NodePreviewSidebar>

        <ReactFlow<IEmbeddingNode>
          nodes={nodes}
          edges={generateActiveNodeEdges(activeChunk?.id, prevNode, nextNode)}
          nodesConnectable={false}
          nodesFocusable={false}
          nodesDraggable={false}
          edgesFocusable={false}
          edgesReconnectable={false}
          zoomOnDoubleClick={false}
          onNodesChange={onNodesChange}
          onSelectionChange={onSelectionChange}
          //@ts-ignore
          nodeTypes={customNodes}
          minZoom={-2}
          maxZoom={10}
          fitView
          fitViewOptions={{
            minZoom: 0,
            maxZoom: 5,
          }}
        >
          <Background />
        </ReactFlow>
      </div>
    </ActiveNodeProvider>
  );
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `${data?.collectionName} Graph`,
    },
  ];
};
