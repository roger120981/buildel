import React from 'react';
import { Link } from '@remix-run/react';

import { Button } from '~/components/ui/button';

export const DocumentationCTA: React.FC = () => {
  return (
    <article className="rounded-xl bg-neutral-850 px-8 py-10 flex justify-between items-center">
      <h3 className="text-white text-lg">
        Check out our documentation for more information.
      </h3>

      <Link to="https://docs.buildel.ai/docs/intro" target="_blank">
        <Button variant="secondary" tabIndex={-1}>
          Documentation
        </Button>
      </Link>
    </article>
  );
};
