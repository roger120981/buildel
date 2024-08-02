import { z } from 'zod';

import type { PaginationQueryParams } from '~/components/pagination/usePagination';
import type { fetchTyped } from '~/utils/fetch.server';
import { buildUrlWithParams } from '~/utils/url';

import type { CreateExperimentSchema } from './experiments.contracts';
import {
  ExperimentResponse,
  ExperimentRunRunsResponse,
  ExperimentRunsResponse,
  ExperimentsResponse,
} from './experiments.contracts';

export class ExperimentsApi {
  constructor(private client: typeof fetchTyped) {}

  async getExperiments(organizationId: string | number) {
    return this.client(
      ExperimentsResponse,
      `/organizations/${organizationId}/experiments`,
    );
  }

  async getExperiment(
    organizationId: string | number,
    experimentId: string | number,
  ) {
    return this.client(
      ExperimentResponse,
      `/organizations/${organizationId}/experiments/${experimentId}`,
    );
  }

  async deleteExperiment(
    organizationId: string | number,
    experimentId: string | number,
  ) {
    return this.client(
      z.any(),
      `/organizations/${organizationId}/experiments/${experimentId}`,
      { method: 'DELETE' },
    );
  }

  async createExperiment(
    organizationId: string | number,
    data: z.TypeOf<typeof CreateExperimentSchema>,
  ) {
    return this.client(
      ExperimentResponse,
      `/organizations/${organizationId}/experiments`,
      { method: 'POST', body: JSON.stringify({ experiment: data }) },
    );
  }

  async getExperimentRuns(
    organizationId: string | number,
    experimentId: string | number,
    pagination?: PaginationQueryParams,
  ) {
    const url = buildUrlWithParams(
      `/organizations/${organizationId}/experiments/${experimentId}/runs`,
      { ...pagination },
    );
    return this.client(ExperimentRunsResponse, url);
  }

  async runExperiment(
    organizationId: string | number,
    experimentId: string | number,
  ) {
    return this.client(
      z.any(),
      `/organizations/${organizationId}/experiments/${experimentId}/runs`,
      { method: 'POST' },
    );
  }

  async getExperimentRunRuns(
    organizationId: string | number,
    experimentId: string | number,
    runId: string | number,
    pagination?: PaginationQueryParams,
  ) {
    const url = buildUrlWithParams(
      `/organizations/${organizationId}/experiments/${experimentId}/runs/${runId}/runs`,
      { ...pagination },
    );
    return this.client(ExperimentRunRunsResponse, url);
  }
}
