import { z } from "zod";
import { UpdateBlockConfig } from "../contracts";

export const schema = z.object({
  id: z.number(),
  name: z.string(),
  config: z.object({
    version: z.string(),
    blocks: z.array(UpdateBlockConfig),
  }),
});
