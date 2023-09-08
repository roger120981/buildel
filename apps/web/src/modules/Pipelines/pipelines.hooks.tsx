'use client';
import { useCallback, useRef, useState } from 'react';
import {
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { Channel, Socket } from 'phoenix';
import { z } from 'zod';
import { TPipeline } from '~/contracts';
import { ENV } from '~/env.mjs';
import { pipelinesApi } from '~/modules/Api';
import { blockTypesApi } from '~/modules/Pipelines/BlockTypesApi';
import { pipelineApi } from '~/modules/Pipelines/PipelineApi';
import {
  BlockConfig,
  BlocksIO,
  IBlockTypesObj,
  IOType,
  IPipeline,
  Pipeline,
  PipelineResponse,
} from '~/modules/Pipelines/pipelines.types';
import { assert } from '~/utils/assert';

export const pipelinesKeys = () => {
  return {
    pipelines: ['pipelines'] as const,
    pipeline: (organizationId: string, pipelineId: string) =>
      [pipelinesKeys().pipelines, organizationId, pipelineId] as const,
  };
};

export function usePipelines(
  organizationId: string,
  options?: UseQueryOptions<{ data: TPipeline[] }>,
) {
  return useQuery<{ data: TPipeline[] }>(
    pipelinesKeys().pipelines,
    () => pipelinesApi.getAll(organizationId),
    { ...options },
  );
}

export function usePipeline(
  organizationId: string,
  pipelineId: string,
  options?: UseQueryOptions<IPipeline>,
) {
  return useQuery<IPipeline>(
    pipelinesKeys().pipeline(organizationId, pipelineId),
    () => pipelineApi.getPipeline(organizationId, pipelineId),
    {
      ...options,
    },
  );
}

export function useUpdatePipeline(
  organizationId: string,
  pipelineId: string,
  {
    onSuccess,
  }: {
    onSuccess?: (response: z.TypeOf<typeof PipelineResponse>) => void;
  } = {},
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pipeline: Omit<z.TypeOf<typeof Pipeline>, 'id'>) => {
      const response = await fetch(
        `${ENV.API_URL}/organizations/${organizationId}/pipelines/${pipelineId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pipeline }),
        },
      );
      const json = await response.json();
      const pipelineResponse = PipelineResponse.parse(json);
      queryClient.setQueryData(
        pipelinesKeys().pipeline(organizationId, pipelineId),
        pipelineResponse,
      );
      onSuccess?.(pipelineResponse);
      return pipelineResponse;
    },
  });
}

export const blockTypesKeys = () => {
  return {
    blockTypes: ['blockTypes'],
  };
};
export function useBlockTypes(options?: UseQueryOptions<IBlockTypesObj>) {
  return useQuery<IBlockTypesObj>(
    blockTypesKeys().blockTypes,
    blockTypesApi.getBlockTypes,
    {
      ...options,
      initialData: options?.initialData ?? {},
    },
  );
}

export function usePipelineRun(
  pipelineId: string,
  onOutput: (
    blockId: string,
    outputName: string,
    payload: unknown,
  ) => void = () => {},
  onStatusChange: (blockId: string, isWorking: boolean) => void = () => {},
) {
  const socket = useRef<Socket>();
  const channel = useRef<Channel>();
  socket.current = new Socket(`${ENV.WEBSOCKET_URL}`, {
    logger: (kind, msg, data) => {
      console.log(`${kind}: ${msg}`, data);
    },
  });

  const [status, setStatus] = useState<'idle' | 'starting' | 'running'>('idle');

  const startRun = useCallback(() => {
    assert(socket.current);

    setStatus('starting');
    const newChannel = socket.current.channel(`pipelines:${pipelineId}`, {});
    newChannel.onMessage = (event: string, payload: any) => {
      if (event.startsWith('output:')) {
        const [_, blockId, outputName] = event.split(':');
        onOutput(blockId, outputName, payload);
      }
      if (event.startsWith('start:')) {
        const [_, blockId] = event.split(':');
        onStatusChange(blockId, true);
      }
      if (event.startsWith('stop:')) {
        const [_, blockId] = event.split(':');
        onStatusChange(blockId, false);
      }
      return payload;
    };
    channel.current = newChannel;

    if (!socket.current.isConnected()) {
      socket.current.connect();
      socket.current.onOpen(() => {
        assert(socket.current);
        newChannel.join().receive('ok', (response) => {
          console.log('Joined successfully', response);
          setStatus('running');
        });
      });
      socket.current.onError(() => {
        setStatus('idle');
      });
    } else if (newChannel.state !== 'joined') {
      newChannel.join().receive('ok', (response) => {
        console.log('Joined successfully', response);
        setStatus('running');
      });
    }
  }, [onOutput, pipelineId]);

  const stopRun = useCallback(() => {
    console.log('stop');
    assert(channel.current);
    channel.current.leave();
    setStatus('idle');
  }, []);

  const push = useCallback(
    (topic: string, payload: any) => {
      if (status !== 'running') {
        alert('Start process first');
      }

      assert(channel.current);

      if (payload instanceof File) {
        payload.arrayBuffer().then((arrayBuffer) => {
          assert(channel.current);
          channel.current.push(`input:${topic}`, arrayBuffer);
        });
      } else if (payload instanceof FileList) {
        [...payload].forEach((file) => {
          file.arrayBuffer().then((arrayBuffer) => {
            assert(channel.current);
            channel.current.push(`input:${topic}`, arrayBuffer);
          });
        });
      } else {
        channel.current.push(`input:${topic}`, payload);
      }
    },
    [status],
  );

  return {
    status,
    startRun,
    stopRun,
    push,
    // io,
  };
}

export function getBlocksIO(blocks: z.TypeOf<typeof BlockConfig>[]): BlocksIO {
  return blocks.reduce(
    ({ inputs, outputs }, block) => {
      const publicInputs = block.block_type.inputs.filter(
        (input) => input.public,
      );
      const publicOutputs = block.block_type.outputs.filter(
        (output) => output.public,
      );

      return {
        inputs: [...inputs, ...nameIO(block.name, publicInputs)],
        outputs: [...outputs, ...nameIO(block.name, publicOutputs)],
      };
    },
    {
      inputs: [] as z.TypeOf<typeof IOType>[],
      outputs: [] as z.TypeOf<typeof IOType>[],
    },
  );
}

function nameIO(name: string, io: z.TypeOf<typeof IOType>[]) {
  return io.map((input) => ({
    ...input,
    name: `${name}:${input.name}`,
  }));
}
