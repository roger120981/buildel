import { useEffect, useMemo, useState } from 'react';
import {
  FieldArray as FA,
  FieldArrayApi as FAI,
  FieldApi as FApi,
  FormApi as FoApi,
  useControlField as ucf,
  useField as uf,
  useFieldArray as ufa,
  useFormScopeOrContext as ufsc,
} from '@rvf/remix';

import { useFormContext } from '~/utils/form';

export const useControlField = ucf;
export const useField = uf;

export const useFormScopeOrContext = ufsc;
export const FieldArray = FA;
export const useFieldArray = ufa;
export type ValidationBehaviorOptions = any; // Define your validation behavior options here
export type FieldArrayApi<T extends any[]> = FAI<T>;
export type FieldApi<T> = FApi<T>;
export type FormApi<T> = FoApi<T>;

export const useCurrentFormState = () => {
  const {
    subscribe,
    formState: { fieldErrors },
  } = useFormContext();
  const form = useFormScopeOrContext();
  const [values, setValues] = useState<any>(form.transient.value() ?? {});

  useEffect(() => {
    subscribe.value((values) => setValues(values));
  }, []);

  return useMemo(() => {
    return { values, subscribe, fieldErrors, getValues: () => values };
  }, [values, subscribe, fieldErrors]);
};