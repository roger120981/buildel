import { z } from "zod";
import {
  BlockConfig,
  ConfigConnection,
  ExtendedBlockConfig,
  UpdateBlockConfig,
} from "~/api/blockType/blockType.contracts";

export const InterfaceConfig = z.object({
  input: z.string().min(2).optional(),
  output: z.string().min(2).optional(),
});

export const Pipeline = z.object({
  id: z.number(),
  name: z.string(),
  organization_id: z.number(),
  runs_count: z.number(),
  interface_config: z.union([InterfaceConfig, z.null()]),
  config: z.object({
    version: z.string(),
    blocks: z.array(BlockConfig),
    connections: z.array(ConfigConnection).default([]),
  }),
});

export const ExtendedPipeline = z.object({
  id: z.number(),
  name: z.string(),
  organization_id: z.number(),
  runs_count: z.number(),
  interface_config: z.union([InterfaceConfig, z.null()]),
  config: z.object({
    version: z.string(),
    blocks: z.array(ExtendedBlockConfig),
    connections: z.array(ConfigConnection).default([]),
  }),
});

export const Alias = z.object({
  id: z.union([z.string().min(1), z.number()]),
  name: z.string().min(2),
  config: z.object({
    version: z.string(),
    blocks: z.array(BlockConfig),
    connections: z.array(ConfigConnection).default([]),
  }),
  interface_config: z.union([InterfaceConfig, z.null()]),
});

export const AliasResponse = z
  .object({
    data: Alias,
  })
  .transform((response) => {
    return response.data;
  });

export type IAliasResponse = z.TypeOf<typeof AliasResponse>;

export const AliasesResponse = z
  .object({ data: z.array(Alias) })
  .transform((response) => response.data);

export type IAliasesResponse = z.TypeOf<typeof AliasesResponse>;

export const PipelineCost = z.object({
  amount: z.string(),
  created_at: z.string(),
  description: z.string(),
  id: z.number(),
});

export const PipelineCosts = z.array(z.object({ data: PipelineCost }));

export const PipelineRun = z.object({
  created_at: z.string(),
  costs: z.array(z.object({ data: PipelineCost })),
  id: z.number(),
  status: z.string(),
  config: z.object({
    version: z.string(),
    blocks: z.array(BlockConfig),
    connections: z.array(ConfigConnection).default([]),
  }),
});

export const PipelineRuns = z.array(PipelineRun);

export const PipelineResponse = z
  .object({
    data: Pipeline,
  })
  .transform((response) => {
    return response.data;
  });

export const PipelinesResponse = z.object({ data: z.array(Pipeline) });

export type IPipelinesResponse = z.TypeOf<typeof PipelinesResponse>;

export type IPipelineResponse = z.TypeOf<typeof PipelineResponse>;

export const PipelineRunsResponse = z
  .object({ data: PipelineRuns })
  .transform((response) => {
    return response.data;
  });
export const PipelineRunResponse = z
  .object({ data: PipelineRun })
  .transform((response) => {
    return response.data;
  });

export const CreateAliasSchema = z.object({
  name: z.string().min(1),
  interface_config: z.union([
    z.string().transform((value) => JSON.parse(value)),
    InterfaceConfig,
    z.null(),
  ]),
  config: z.object({
    version: z.string(),
    blocks: z.union([
      z.string().transform((value) => JSON.parse(value)),
      z.array(UpdateBlockConfig),
    ]),
    connections: z.union([
      z.string().transform((value) => JSON.parse(value)),
      z.array(ConfigConnection).default([]),
    ]),
  }),
});

export const UpdatePipelineSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  interface_config: z.union([InterfaceConfig, z.null()]),
  config: z.object({
    version: z.string(),
    blocks: z.array(UpdateBlockConfig),
    connections: z.array(ConfigConnection).default([]),
  }),
});

export const CreatePipelineSchema = z.object({
  pipeline: z.object({
    name: z.string().min(2),
    config: z.object({
      version: z.string(),
      connections: z.union([
        z.string().transform((value) => JSON.parse(value)),
        z.array(ConfigConnection).default([]),
      ]),
      blocks: z.union([
        z.string().transform((value) => JSON.parse(value)),
        z.array(UpdateBlockConfig),
      ]),
    }),
  }),
});
