import { json, LoaderFunctionArgs } from "@remix-run/node";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import invariant from "tiny-invariant";
import { PipelineApi } from "~/api/pipeline/PipelineApi";
import { BlockTypesResponse } from "~/api/pipeline/pipeline.contracts";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");
    invariant(params.runId, "runId not found");

    const blockTypesPromise = fetch(BlockTypesResponse, `/block_types`);

    const pipelineApi = new PipelineApi(fetch);

    const pipelinePromise = pipelineApi.getPipeline(
      params.organizationId,
      params.pipelineId
    );

    const pipelineRunPromise = pipelineApi.getPipelineRun(
      params.organizationId,
      params.pipelineId,
      params.runId
    );

    const [blockTypes, pipeline, pipelineRun] = await Promise.all([
      blockTypesPromise,
      pipelinePromise,
      pipelineRunPromise,
    ]);

    const blocks = pipelineRun.data.config.blocks.map((block) => ({
      ...block,
      block_type: blockTypes.data.data.find(
        (blockType) => blockType.type === block.type
      ),
    }));

    return json({
      pipeline: {
        ...pipeline.data,
        config: { ...pipeline.data.config, blocks },
      },
      pipelineRun: {
        ...pipelineRun.data,
        config: { ...pipelineRun.data.config, blocks },
      },
      blockTypes: blockTypes.data.data,
    });
  })(args);
}
