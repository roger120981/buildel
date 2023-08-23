'use client';

import React, { PropsWithChildren, useCallback, useState } from 'react';
import { z } from 'zod';
import { AddBlockForm } from '~/modules/Pages';
import {
  BlockModal,
  BlockModalHeader,
} from '~/modules/Pages/PipelinePage/BlockModal';
import { EditBlockForm } from '~/modules/Pages/PipelinePage/EditBlockForm';
import { PipelineFlow } from '~/modules/Pages/PipelinePage/PipelineFlow';
import {
  useBlockTypes,
  usePipeline,
  useUpdatePipeline,
} from '~/modules/Pipelines';
import {
  BlockConfig,
  IBlockConfig,
  IPipeline,
  IPipelineConfig,
} from '~/modules/Pipelines/pipelines.types';
import { assert } from '~/utils/assert';
import { useModal } from '~/utils/hooks';
import { PipelineHeader } from './PipelineHeader';
import 'reactflow/dist/style.css';

interface PipelineBoardProps extends PropsWithChildren {
  pipelineId: string;
  initialData?: IPipeline;
}

export function PipelineBoard({
  pipelineId,
  initialData,
  children,
}: PipelineBoardProps) {
  const { isModalOpen, openModal, closeModal } = useModal();
  const [editableBlock, setEditableBlock] = useState<IBlockConfig | null>(null);

  const { data: blockTypes } = useBlockTypes();
  const { data: pipeline, isLoading } = usePipeline(pipelineId, {
    initialData,
  });

  const { mutate: updatePipeline, isLoading: isUpdating } =
    useUpdatePipeline(pipelineId);

  const handleEditBlock = useCallback((block: IBlockConfig) => {
    setEditableBlock(block);
    openModal();
  }, []);

  const handleCloseModal = useCallback(() => {
    setEditableBlock(null);
    closeModal();
  }, []);

  const handleUpdate = useCallback(
    (updated: IPipelineConfig) => {
      assert(pipeline);

      updatePipeline({
        config: { version: pipeline.config.version, ...updated },
        name: pipeline.name,
      });
    },
    [pipeline],
  );

  const handleSave = useCallback(() => {
    assert(pipeline);

    updatePipeline(pipeline);
  }, [pipeline]);

  const handleUpdateBlock = useCallback(
    (data: IBlockConfig) => {
      assert(pipeline);
      assert(editableBlock);

      updatePipeline({
        ...pipeline,
        config: {
          ...pipeline.config,
          blocks: pipeline.config.blocks.map((block) => {
            if (block.name === editableBlock.name) {
              return data;
            }
            return block;
          }),
        },
      });

      handleCloseModal();
    },
    [pipeline, editableBlock],
  );

  const handleAddBlock = useCallback(
    (data: z.TypeOf<typeof BlockConfig>) => {
      assert(pipeline);
      updatePipeline({
        name: pipeline.name,
        config: {
          version: pipeline.config.version,
          blocks: [...pipeline.config.blocks, data],
        },
      });
      handleCloseModal();
    },

    [pipeline],
  );

  if (isLoading) return <p>Loading...</p>;
  if (!pipeline || !blockTypes) return;

  return (
    <div className="relative h-[90vh] w-full">
      <PipelineFlow
        pipeline={pipeline}
        blockTypes={blockTypes}
        onUpdate={handleUpdate}
        onEditBlock={handleEditBlock}
      />
      {children}

      <div className="absolute right-0 top-0 flex gap-2">
        <button onClick={openModal}>TMP ADD</button>
        <PipelineHeader isUpdating={isUpdating} onSave={handleSave} />
      </div>

      <BlockModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        header={
          <BlockModalHeader
            heading={editableBlock ? 'Edit Block' : 'Add Block'}
            description="Blocks are modules within your app that can work simultaneously."
          />
        }
      >
        {editableBlock ? (
          <EditBlockForm
            onSubmit={handleUpdateBlock}
            blockConfig={editableBlock}
          />
        ) : (
          <AddBlockForm onSubmit={handleAddBlock} />
        )}
      </BlockModal>
    </div>
  );
}
