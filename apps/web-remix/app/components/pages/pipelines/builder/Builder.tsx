import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFetcher } from "@remix-run/react";
import {
  IBlockConfig,
  IBlockTypes,
  IEdge,
  IPipeline,
  IPipelineConfig,
} from "../pipeline.types";
import { useModal } from "~/hooks/useModal";
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  EdgeProps,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "reactflow";
import {
  getAllBlockTypes,
  getEdges,
  getLastBlockNumber,
  getNodes,
  isValidConnection,
  toPipelineConfig,
} from "./PipelineFlow.utils";
import { CustomNode, CustomNodeProps } from "./CustomNodes/CustomNode";
import isEqual from "lodash.isequal";
import { useDraggableNodes } from "./useDraggableNodes";
import { RunPipelineProvider } from "./RunPipelineProvider";
import { EditBlockForm } from "./EditBlockForm";
import { BuilderHeader } from "./BuilderHeader";
import { BlockInputList } from "./BlockInputList";
import { CustomEdge } from "./CustomEdges/CustomEdge";
import {
  ActionSidebar,
  ActionSidebarHeader,
} from "~/components/sidebar/ActionSidebar";
import { useBeforeUnloadWarning } from "~/hooks/useBeforeUnloadWarning";
import { CreateBlockFloatingMenu } from "./CreateBlock/CreateBlockFloatingMenu";
interface BuilderProps {
  pipeline: IPipeline;
  blockTypes: IBlockTypes;
}

export const Builder: React.FC<BuilderProps> = ({ pipeline, blockTypes }) => {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const updateFetcher = useFetcher<IPipeline>();
  const {
    isModalOpen: isSidebarOpen,
    openModal: openSidebar,
    closeModal: closeSidebar,
  } = useModal();
  const [editableBlock, setEditableBlock] = useState<IBlockConfig | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(
    getNodes(pipeline.config)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    getEdges(pipeline.config)
  );

  console.log(nodes);
  const isUpToDate = isEqual(
    //@ts-ignore
    toPipelineConfig(nodes, edges),
    pipeline.config
  );

  useBeforeUnloadWarning(!isUpToDate);

  const handleIsValidConnection = useCallback(
    (connection: Connection) =>
      //@ts-ignore
      isValidConnection(toPipelineConfig(nodes, edges), connection),
    [edges, nodes]
  );

  const handleDelete = useCallback(
    (node: IBlockConfig) =>
      setNodes((nds) => nds.filter((nd) => nd.id !== node.name)),
    [setNodes]
  );

  const handleEditBlock = useCallback(
    (block: IBlockConfig) => {
      setEditableBlock(block);
      openSidebar();
    },
    [openSidebar]
  );

  const handleCloseModal = useCallback(() => {
    setEditableBlock(null);
    closeSidebar();
  }, [closeSidebar]);

  const handleUpdate = useCallback(
    (config: IPipelineConfig) => {
      updateFetcher.submit(
        { ...pipeline, config: { ...config } },
        { method: "PUT", encType: "application/json" }
      );
    },
    [updateFetcher, pipeline]
  );

  const onBlockCreate = useCallback(
    async (created: IBlockConfig) => {
      //@ts-ignore
      const sameBlockTypes = getAllBlockTypes(
        //@ts-ignore
        toPipelineConfig(nodes, edges),
        created.type
      );
      const nameNum = getLastBlockNumber(sameBlockTypes) + 1;
      const name = `${created.type.toLowerCase()}_${nameNum}`;

      setNodes((prev) => [
        ...prev,
        {
          id: name,
          type: created.type,
          position: created.position!,
          data: { ...created, name },
        },
      ]);
    },
    [setNodes, nodes, edges]
  );

  const onBlockUpdate = useCallback(
    (updated: IBlockConfig) => {
      const updatedNodes = nodes.map((node) => {
        if (node.id === updated.name) {
          node.data = updated;
        }
        return node;
      });
      setNodes(updatedNodes);
      //@ts-ignore
      handleUpdate(toPipelineConfig(updatedNodes, edges));
      handleCloseModal();
    },
    [edges, handleUpdate, nodes, setNodes]
  );

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds) as IEdge[]);
  }, []);

  const handleDeleteEdge = useCallback((id: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== id) as IEdge[]);
  }, []);

  const PipelineNode = useCallback(
    (props: CustomNodeProps) => (
      <CustomNode
        {...props}
        onUpdate={handleEditBlock}
        onDelete={handleDelete}
      />
    ),
    [handleDelete]
  );

  const nodeTypes = useMemo(() => {
    return blockTypes.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.type]: PipelineNode,
      }),
      {}
    );
  }, [PipelineNode, blockTypes.length]);

  const PipelineEdge = useCallback(
    (props: EdgeProps) => <CustomEdge {...props} onDelete={handleDeleteEdge} />,
    [handleDeleteEdge]
  );

  const edgeTypes = useMemo(() => {
    return { default: PipelineEdge };
  }, [PipelineEdge]);

  const handleSaveUnsavedChanges = useCallback(() => {
    // @ts-ignore
    const config = toPipelineConfig(nodes, edges);
    if (isEqual(config, pipeline.config)) return;

    handleUpdate(config);
  }, [edges, handleUpdate, nodes, pipeline.config]);

  useEffect(() => {
    if (updateFetcher.state === "idle" && updateFetcher.data !== null) {
      const config = updateFetcher.data;
      if (!config || isEqual(config, pipeline.config)) return;

      setNodes(getNodes(config.config));
      setEdges(getEdges(config.config));
    }
  }, [pipeline.config, updateFetcher]);

  const { onDragOver, onDrop, onInit } = useDraggableNodes({
    wrapper: reactFlowWrapper,
    onDrop: onBlockCreate,
  });

  return (
    <div
      className="relative pt-5 h-[calc(100vh_-_128px)] w-full"
      ref={reactFlowWrapper}
    >
      <RunPipelineProvider
        //@ts-ignore
        pipeline={{ ...pipeline, config: toPipelineConfig(nodes, edges) }}
      >
        <ReactFlowProvider>
          <BuilderHeader
            isUpToDate={isUpToDate}
            onSave={handleSaveUnsavedChanges}
          />

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onInit={onInit}
            onDrop={onDrop}
            onDragOver={onDragOver}
            isValidConnection={handleIsValidConnection}
            fitViewOptions={{
              minZoom: 0.5,
              maxZoom: 1,
            }}
            fitView
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={35}
              color="#aaa"
              className="bg-black rounded-lg"
            />
            <Controls />
          </ReactFlow>

          <ActionSidebar
            isOpen={!!editableBlock || isSidebarOpen}
            onClose={handleCloseModal}
          >
            {editableBlock ? (
              <>
                <ActionSidebarHeader
                  heading={editableBlock.type}
                  subheading="Open AI’s Large Language Model chat block."
                  onClose={handleCloseModal}
                />
                <EditBlockForm
                  onSubmit={onBlockUpdate}
                  blockConfig={editableBlock}
                  organizationId={pipeline.organization_id}
                  pipelineId={pipeline.id}
                >
                  <BlockInputList inputs={editableBlock.inputs} />
                </EditBlockForm>
              </>
            ) : null}
          </ActionSidebar>

          <CreateBlockFloatingMenu onCreate={onBlockCreate} />
        </ReactFlowProvider>
      </RunPipelineProvider>
    </div>
  );
};
