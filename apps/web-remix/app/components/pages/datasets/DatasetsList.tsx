import React from 'react';

import { BasicLink } from '~/components/link/BasicLink';
import { EmptyMessage, ItemList } from '~/components/list/ItemList';
import type { IDataset } from '~/components/pages/datasets/dataset.types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { dayjs } from '~/utils/Dayjs';
import { routes } from '~/utils/routes.utils';

interface DatasetsListProps {
  items: IDataset[];
  organizationId: string;
}

export const DatasetsList: React.FC<DatasetsListProps> = ({
  items,
  organizationId,
}) => {
  return (
    <ItemList
      aria-label="Memory collections list"
      className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      items={items}
      emptyText={
        <EmptyMessage className="block mt-14 md:mt-20">
          There are no Datasets yet...
        </EmptyMessage>
      }
      renderItem={(item) => (
        <BasicLink to={routes.dataset(organizationId, item.id)}>
          <DatasetsListItem data={item} organizationId={organizationId} />
        </BasicLink>
      )}
    />
  );
};

interface DatasetsListItemProps {
  data: IDataset;
  organizationId: string;
}

export const DatasetsListItem: React.FC<DatasetsListItemProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="line-clamp-2">{data.name}</CardTitle>
      </CardHeader>

      <CardContent>
        <CardDescription>{dayjs(data.created_at).format()}</CardDescription>
      </CardContent>
    </Card>
  );
};
