import * as React from "react";
import { z } from "zod";
import { Button } from "@elpassion/taco";
import { generateZODSchema } from "~/components/form/schema/SchemaParser";
import { BlockConfig } from "../contracts";
import { FieldProps, Schema } from "~/components/form/schema/Schema";
import {
  ArrayField,
  BooleanField,
  NumberField,
  StringField,
} from "~/components/form/schema/SchemaFields";
import { ValidatedForm, useFormContext } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import {
  Field as FormField,
  HiddenField,
} from "~/components/form/fields/field.context";
import { MonacoEditorField } from "~/components/form/fields/monacoEditor.field";
import { ReactNode, useCallback, useEffect } from "react";
import { assert } from "~/utils/assert";
import { AsyncSelectField } from "~/components/form/fields/asyncSelect.field";

export function EditBlockForm({
  onSubmit,
  blockConfig,
  children,
  organizationId,
  pipelineId,
}: {
  organizationId: number;
  pipelineId: number;
  children?: ReactNode;
  onSubmit: (data: z.TypeOf<typeof BlockConfig>) => void;
  blockConfig: z.TypeOf<typeof BlockConfig>;
}) {
  const schema = generateZODSchema(blockConfig.block_type.schema as any);
  const validator = React.useMemo(() => withZod(schema), []);

  const handleUpdate = (
    data: Record<string, any>,
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    onSubmit({ ...blockConfig, ...data });
  };

  const EditorField = useCallback(
    (props: FieldProps) => {
      assert(props.field.type === "string");
      return (
        <FormField name={props.name!}>
          <MonacoEditorField
            supportingText={props.field.description}
            label={props.field.title}
            suggestions={generateSuggestions(blockConfig.inputs)}
          />
        </FormField>
      );
    },
    [blockConfig.inputs]
  );

  const SelectField = useCallback(
    (props: FieldProps) => {
      assert(props.field.type === "string");
      if (
        !("presentAs" in props.field) ||
        props.field.presentAs !== "async-select"
      ) {
        return;
      }

      const baseMemoryCollection = `${pipelineId}_${blockConfig.name}`;

      return (
        <FormField name={props.name!}>
          <AsyncSelectField
            url={props.field.url.replace(
              ":organization_id",
              organizationId.toString()
            )}
            label={props.field.title}
            supportingText={props.field.description}
            defaultValue={props.field.default}
            additionalOptions={[
              {
                name: baseMemoryCollection,
                id: baseMemoryCollection,
              },
            ]}
          />
        </FormField>
      );
    },
    [blockConfig.name, organizationId, pipelineId]
  );

  return (
    <ValidatedForm
      // @ts-ignore
      validator={validator}
      defaultValues={blockConfig}
      onSubmit={handleUpdate}
      className="w-full grow flex flex-col h-[60%]"
      noValidate
    >
      <div className="space-y-4 grow max-h-full overflow-y-auto px-1">
        <HiddenField name="name" value={blockConfig.name} />
        <HiddenField name="inputs" value={JSON.stringify(blockConfig.inputs)} />

        <Schema
          schema={blockConfig.block_type.schema as any}
          name="opts"
          fields={{
            string: StringField,
            number: NumberField,
            array: ArrayField,
            boolean: BooleanField,
            editor: EditorField,
            asyncSelect: SelectField,
          }}
        />

        {children}
      </div>

      <Button size="sm" type="submit" variant="filled" className="mt-6" isFluid>
        Save changes
      </Button>

      <TriggerValidation />
    </ValidatedForm>
  );
}

function TriggerValidation() {
  const { validate } = useFormContext();

  useEffect(() => {
    validate();
  }, [validate]);
  return null;
}

function generateSuggestions(inputs: string[]) {
  return inputs.map((suggestion) => suggestion.split("->").at(0) ?? "");
}
