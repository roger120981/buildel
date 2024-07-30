import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { BlockTypeApi } from '~/api/blockType/BlockTypeApi';
import { PipelineApi } from '~/api/pipeline/PipelineApi';
import type { IIOType } from '~/components/pages/pipelines/pipeline.types';
import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, 'organizationId not found');
    invariant(params.pipelineId, 'pipelineId not found');

    const blockTypeApi = new BlockTypeApi(fetch);
    const pipelineApi = new PipelineApi(fetch);
    const aliasId = pipelineApi.getAliasFromUrl(request.url);

    const blockTypesPromise = blockTypeApi.getBlockTypes();

    const pipelinePromise = pipelineApi.getAliasedPipeline(
      params.organizationId,
      params.pipelineId,
      aliasId,
    );

    const [pipeline, blockTypes] = await Promise.all([
      pipelinePromise,
      blockTypesPromise,
    ]);

    const blocks = await Promise.all(
      pipeline.config.blocks.map(async (block) => {
        const blockType = blockTypes.data.find(
          (blockType) => blockType.type === block.type,
        );
        if (!blockType) return block;

        if (blockType.dynamic_ios && block.opts.workflow) {
          const { data: dynamicIOs } = await blockTypeApi.getBlockDynamicIOs(
            prepareIOsUrl(blockType.dynamic_ios, {
              organization_id: params.organizationId as string,
              'opts.workflow': block.opts.workflow,
            }),
          );

          const inputs = getPublicIOs(dynamicIOs.data.inputs).map(prepareIO);
          const outputs = getPublicIOs(dynamicIOs.data.outputs).map(prepareIO);
          const ios = getPublicIOs(dynamicIOs.data.ios).map(prepareIO);

          return {
            ...block,
            block_type: {
              ...blockType,
              inputs: [...blockType.inputs, ...inputs],
              outputs: [...blockType.outputs, ...outputs],
              ios: [...blockType.ios, ...ios],
            },
          };
        } else {
          return {
            ...block,
            block_type: blockType,
          };
        }
      }),
    );
    return json({
      pipeline: { ...pipeline, config: { ...pipeline.config, blocks } },
      aliasId: aliasId,
      blockTypes: blockTypes.data,
      pipelineId: params.pipelineId,
      organizationId: params.organizationId,
    });
  })(args);
}

function getPublicIOs(ios: IIOType[]) {
  return ios.filter((io) => io.public);
}

function prepareIO(io: IIOType) {
  return { ...io, public: false };
}

function prepareIOsUrl(url: string, context: Record<string, string>) {
  return url
    .replace(/{{(.*?)}}/g, (_, key) => context[key])
    .replace('/api', '');
}
