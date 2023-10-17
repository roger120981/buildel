import z from "zod";

export const schema = z.object({
  id: z.number(),
  name: z.string().min(2),
  value: z.string().min(2),
});
