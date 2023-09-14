import { ActionArgs } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import { validationError } from "remix-validated-form";
import invariant from "tiny-invariant";
import { requireLogin } from "~/session.server";
import { actionBuilder } from "~/utils.server";
import { PipelineResponse } from "../contracts";
import { updateSchema, uploadSchema } from "./schema";
import { z } from "zod";

export async function action(actionArgs: ActionArgs) {
  return actionBuilder({
    put: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, "Missing organizationId");
      invariant(params.pipelineId, "Missing pipelineId");

      const validator = withZod(updateSchema);

      const result = await validator.validate(await actionArgs.request.json());

      if (result.error) return validationError(result.error);

      const res = await fetch(
        PipelineResponse,
        `/organizations/${params.organizationId}/pipelines/${params.pipelineId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pipeline: result.data,
          }),
        }
      );

      return res.data;
    },
    post: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, "Missing organizationId");

      const validator = withZod(uploadSchema);

      const formData = await request.formData();

      const result = await validator.validate(formData);

      if (result.error) return validationError(result.error);
      console.log(result.data);
      const f = new FormData();
      f.append("collection_name", "dupa");
      const res = await fetch(
        z.any(),
        `/organizations/${params.organizationId}/memories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: f,
        }
      );
      console.log(res);
      return {};
    },
  })(actionArgs);
}
