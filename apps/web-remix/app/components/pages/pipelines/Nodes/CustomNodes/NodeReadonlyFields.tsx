import React, { useEffect, useMemo, useState } from 'react';
import startCase from 'lodash.startcase';

import { asyncSelectApi } from '~/api/AsyncSelectApi';
import { toSelectOption } from '~/components/form/fields/asyncSelect.field';
import type {
  JSONSchemaField,
  JSONSchemaObjectField,
} from '~/components/form/schema/SchemaParser';
import { useOrganizationId } from '~/hooks/useOrganizationId';
import { usePipelineId } from '~/hooks/usePipelineId';
import { cn } from '~/utils/cn';

import { NodePromptInputs } from './NodePromptInputs';
import {
  NodeReadonlyBooleanValue,
  NodeReadonlyItemTextarea,
  NodeReadonlyItemTitle,
  NodeReadonlyItemValue,
  NodeReadonlyItemWrapper,
} from './NodeReadonly.components';

interface NodeReadonlyFieldsProps {
  schema?: JSONSchemaField;
  data: Record<string, unknown>;
  blockName: string;
}

//@todo fixed JSONSchemaField typing in app
export const NodeReadonlyFields = ({
  schema,
  data,
  blockName,
}: NodeReadonlyFieldsProps) => {
  const properties = useMemo(() => {
    //@ts-ignore
    if (isObjectField(schema?.properties?.opts)) {
      //@ts-ignore
      const properties = (schema?.properties?.opts?.properties ??
        {}) as JSONSchemaObjectField;
      return Object.entries(properties).reduce(
        (acc, [key, value]) => {
          //@ts-ignore
          if (value?.readonly) return { ...acc, [key]: value };

          return acc;
        },
        {} as Record<string, any>,
      );
    }

    return {};
  }, [schema]);

  const renderProperties = useMemo(() => {
    return Object.keys(properties).map((key) => {
      // only string/number/boolean types right now
      if (
        properties[key].type !== 'string' &&
        properties[key].type !== 'number' &&
        properties[key].type !== 'boolean'
      ) {
        return null;
      }

      return (
        <li
          key={key}
          className={cn('pt-1 [&:not(:last-child)]:pb-3', {
            'basis-full [&:not(:first-child)]:border-t border-input':
              properties[key].presentAs === 'editor',
            hidden: !showValue(data[key]),
          })}
        >
          <NodeReadonlyItem
            properties={properties[key]}
            blockName={blockName}
            data={data}
            id={key}
          />
        </li>
      );
    });
  }, [properties]);

  return (
    <ul className="flex gap-x-4 flex-wrap max-w-[350px] w-full">
      {renderProperties}
    </ul>
  );
};

interface NodeReadonlyItemProps {
  properties: Record<string, any>;
  data: Record<string, any>;
  id: string;
  blockName: string;
}

function NodeReadonlyItem({
  properties,
  id,
  data,
  blockName,
}: NodeReadonlyItemProps) {
  if (
    properties.presentAs === 'async-creatable-select' ||
    properties.presentAs === 'async-select'
  ) {
    return (
      <NodeReadonlyAsyncItem
        url={properties.url}
        value={data[id]}
        label={id}
        context={data}
      />
    );
  }

  const isEditor = properties.presentAs === 'editor';

  if (isEditor) {
    return (
      <NodeReadonlyItemWrapper className="pt-1" show={showValue(data[id])}>
        <NodeReadonlyItemTitle className="mb-1">
          {startCase(id)}
        </NodeReadonlyItemTitle>

        <NodeReadonlyItemTextarea value={data[id]} />

        <NodePromptInputs
          template={data[id]}
          className="mt-1"
          blockName={blockName}
        />
      </NodeReadonlyItemWrapper>
    );
  }

  if (properties.type === 'boolean') {
    return (
      <NodeReadonlyItemWrapper show={showValue(data[id])}>
        <NodeReadonlyItemTitle>{startCase(id)}</NodeReadonlyItemTitle>
        <NodeReadonlyBooleanValue value={data[id]} />
      </NodeReadonlyItemWrapper>
    );
  }

  return (
    <NodeReadonlyItemWrapper show={showValue(data[id])}>
      <NodeReadonlyItemTitle>{startCase(id)}</NodeReadonlyItemTitle>
      <NodeReadonlyItemValue>{data[id]}</NodeReadonlyItemValue>
    </NodeReadonlyItemWrapper>
  );
}

interface NodeReadonlyAsyncItemProps {
  url: string;
  value: string;
  context: Record<string, any>;
  label: string;
}

function NodeReadonlyAsyncItem({
  url,
  value,
  context,
  label,
}: NodeReadonlyAsyncItemProps) {
  const organizationId = useOrganizationId();
  const pipelineId = usePipelineId();

  const [finalValue, setFinalValue] = useState(value);

  const readyUrl = url
    .replace('{{organization_id}}', organizationId.toString())
    .replace('{{pipeline_id}}', pipelineId.toString())
    .replace(/{{([\w.]+)}}/g, (_fullMatch, key) => {
      const cleanedKey = key.replace(/^[^.]+\./, '');

      const replacedValue = context[cleanedKey];

      return replacedValue ?? cleanedKey;
    });

  const fetchOptions = async () => {
    return asyncSelectApi
      .getData(readyUrl)
      .then((opts) => opts.map(toSelectOption));
  };

  useEffect(() => {
    fetchOptions().then((options) => {
      setFinalValue(
        options.find((option) => option.value === value)?.label ?? value,
      );
    });
  }, [url, value]);

  return (
    <NodeReadonlyItemWrapper show={!!finalValue}>
      <NodeReadonlyItemTitle>{startCase(label)}</NodeReadonlyItemTitle>
      <NodeReadonlyItemValue>{finalValue}</NodeReadonlyItemValue>
    </NodeReadonlyItemWrapper>
  );
}

const isObjectField = (
  schema?: JSONSchemaField,
): schema is JSONSchemaObjectField => {
  return (schema as JSONSchemaObjectField)?.type === 'object';
};

function showValue(value: unknown) {
  if (typeof value === 'boolean' || typeof value === 'number') {
    return true;
  }

  return !!value;
}
