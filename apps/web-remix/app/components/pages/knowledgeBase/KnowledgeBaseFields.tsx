import React from 'react';
import { useLoaderData } from '@remix-run/react';
import get from 'lodash.get';
import type { RenderDOMFunc } from 'rc-select/es/interface';

import { AsyncSelectField } from '~/components/form/fields/asyncSelect.field';
import {
  Field,
  Field as FormField,
} from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { useCurrentFormState } from '~/components/form/fields/form.field';
import {
  RadioField,
  RadioGroupField,
} from '~/components/form/fields/radio.field';
import type { loader } from '~/components/pages/knowledgeBase/newKnowledgeBase/loader.server';
import { Label } from '~/components/ui/label';
import { useFormContext } from '~/utils/form';

interface ApiTypesRadioGroupFieldProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}
export function ApiTypesRadioGroupField({
  onChange,
  disabled,
}: ApiTypesRadioGroupFieldProps) {
  return (
    <Field name="embeddings.api_type">
      <FieldLabel>Embeddings API Type</FieldLabel>
      <RadioGroupField onChange={onChange}>
        {['openai', 'mistral'].map((value) => (
          <Label key={value} className="flex gap-1 items-center">
            <RadioField id={value} value={value} disabled={disabled} />

            <span>{value}</span>
          </Label>
        ))}
      </RadioGroupField>
      <FieldMessage />
    </Field>
  );
}

interface ModelSelectFieldProps {
  disabled?: boolean;
  getPopupContainer?: RenderDOMFunc;
}

export function ModelSelectField({
  disabled,
  getPopupContainer,
}: ModelSelectFieldProps) {
  const { organizationId } = useLoaderData<typeof loader>();
  const { values, fieldErrors } = useCurrentFormState();

  const api_type = get(values, 'embeddings.api_type');

  return (
    <FormField name="embeddings.model">
      <AsyncSelectField
        id="model"
        url={`/api/organizations/${organizationId}/models/embeddings?api_type=${api_type}`}
        label="Model"
        supportingText="The model to use for the embeddings."
        errorMessage={fieldErrors['embeddings.model']}
        disabled={disabled}
        getPopupContainer={getPopupContainer}
      />
    </FormField>
  );
}

export function SecretSelectField({
  getPopupContainer,
}: {
  getPopupContainer?: RenderDOMFunc;
}) {
  const { organizationId } = useLoaderData<typeof loader>();
  const {
    formState: { fieldErrors },
  } = useFormContext();

  return (
    <FormField name="embeddings.secret_name">
      <AsyncSelectField
        url={`/api/organizations/${organizationId}/secrets`}
        label="Secret"
        id="secret"
        supportingText="The secret to use for the embeddings."
        errorMessage={fieldErrors['embeddings.secret_name']}
        getPopupContainer={getPopupContainer}
      />
    </FormField>
  );
}
