import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { AppNavbar, AppNavbarHeading } from '~/components/navbar/AppNavbar';
import { Pagination } from '~/components/pagination/Pagination';
import { routes } from '~/utils/routes.utils';

import { ExperimentRunRunsTable } from './ExperimentRunRunsTable/ExperimentRunRunsTable';
import type { loader } from './loader.server';

export function ExperimentRunPage() {
  const {
    organizationId,
    experimentId,
    experiment,
    experimentRunRuns,
    runId,
    pagination,
  } = useLoaderData<typeof loader>();

  return (
    <>
      <AppNavbar
        leftContent={
          <AppNavbarHeading>
            Experiment {experiment.name} | {runId}
          </AppNavbarHeading>
        }
      />

      <PageContentWrapper className="mt-6 lg:mt-[120px] pb-3">
        <ExperimentRunRunsTable data={experimentRunRuns} />

        <div className="flex justify-end mt-4">
          <Pagination
            pagination={pagination}
            loaderUrl={routes.experimentRun(
              organizationId,
              experimentId,
              runId,
            )}
          />
        </div>
      </PageContentWrapper>
    </>
  );
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `Experiment Run ${data?.runId}`,
    },
  ];
};