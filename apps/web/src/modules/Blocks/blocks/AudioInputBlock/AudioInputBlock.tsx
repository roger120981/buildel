'use client';

import React from 'react';
import { Code } from '@mantine/core';
import { BlockWrapper } from '~/modules/Blocks';
import { AudioRecorder } from '.';

export const AudioInputBlock = () => {
  // Debugging
  const [data, setData] = React.useState({
    name: 'audio_input',
  });
  const dataCode = `${JSON.stringify(data, null, 2)}`;

  return (
    <BlockWrapper name="AudioInput">
      <AudioRecorder />
      <div className="mb-4" />
      <Code block>{dataCode}</Code>
    </BlockWrapper>
  );
};
