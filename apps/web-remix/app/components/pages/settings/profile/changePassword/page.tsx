import { useMemo } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';

import { Field } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { TextInputField } from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';

import { Section, SectionContent } from '../../settingsLayout/PageLayout';
import { changePasswordSchema } from './schema';

export function ChangePasswordPage() {
  const validator = useMemo(() => withZod(changePasswordSchema), []);

  return (
    <ValidatedForm
      validator={validator}
      method="post"
      noValidate
      className="w-full grow flex flex-col gap-2 h-[70%]"
    >
      <div className="max-w-s w-full grow overflow-y-auto p-1">
        <Field name="current_password">
          <FieldLabel>Current password</FieldLabel>
          <TextInputField type="password" autoFocus />
          <FieldMessage />
        </Field>
        <Field name="password">
          <FieldLabel>New password</FieldLabel>
          <TextInputField type="password" />
          <FieldMessage />
        </Field>
        <Field name="password_confirmation">
          <FieldLabel>Confirm password</FieldLabel>
          <TextInputField type="password" />
          <FieldMessage />
        </Field>
      </div>
      <Section>
        <SectionContent>
          <p className="text-red-500">
            This operation will log out all your currently logged in devices
            with this one included.
          </p>
        </SectionContent>
      </Section>
      <SubmitButton size="sm">Change password</SubmitButton>
    </ValidatedForm>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Change password',
    },
  ];
};
