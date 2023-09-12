import React, { forwardRef } from "react";
import { useFieldContext } from "~/components/form/fields/field.context";
import {
  QuantityInput,
  QuantityInputProps,
} from "~/components/form/inputs/quantity.input";

export const QuantityInputField = forwardRef<
  HTMLInputElement,
  Partial<QuantityInputProps>
>((props, ref) => {
  const { name, getInputProps, error } = useFieldContext();
  return (
    <QuantityInput
      name={name}
      ref={ref}
      aria-invalid={error ? true : undefined}
      aria-describedby={`${name}-error`}
      aria-errormessage={error ? `${name}-error` : undefined}
      autoComplete={name}
      {...props}
      {...getInputProps()}
    />
  );
});
