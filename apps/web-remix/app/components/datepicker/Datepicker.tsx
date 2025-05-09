import type { ReactNode } from 'react';
import React from 'react';
import ReactDatePicker from 'react-datepicker';
import type { ReactDatePickerProps } from 'react-datepicker';
import { ClientOnly } from 'remix-utils/client-only';

import 'react-datepicker/dist/react-datepicker.css';

const DatepickerClient: React.FC<ReactDatePickerProps> = ({
  children,
  ...rest
}) => {
  // eslint-disable-next-line
  // @ts-ignore
  return <ReactDatePicker {...rest}>{children}</ReactDatePicker>;
};

export interface DatepickerProps extends ReactDatePickerProps {
  fallback?: ReactNode;
}
export const Datepicker = ({ fallback, ...props }: DatepickerProps) => {
  return (
    <ClientOnly fallback={fallback}>
      {() => <DatepickerClient {...props} />}
    </ClientOnly>
  );
};
