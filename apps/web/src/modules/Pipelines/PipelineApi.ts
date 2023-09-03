import { ENV } from '~/env.mjs';
import { IPipeline, PipelineResponse } from './pipelines.types';

export class PipelineApi {
  async getPipeline(
    organizationId: string,
    pipelineId: string,
  ): Promise<IPipeline> {
    const response = await fetch(
      `${ENV.API_URL}/organizations/${organizationId}/pipelines/${pipelineId}`,
      {
        cache: 'no-cache',
      },
    );
    const json = await response.json();

    return PipelineResponse.parse(json);
  }
}

export const pipelineApi = new PipelineApi();
