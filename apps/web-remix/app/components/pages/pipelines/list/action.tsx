import { ActionArgs, json } from "@remix-run/node";
import { actionBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import invariant from "tiny-invariant";
import { z } from "zod";

export async function action(actionArgs: ActionArgs) {
  return actionBuilder({
    delete: async ({ params, request }, { fetch }) => {
      requireLogin(request);
      invariant(params.organizationId, "Missing organizationId");
      const pipelineId = (await request.formData()).get("pipelineId");

      await fetch(
        z.any(),
        `/organizations/${params.organizationId}/pipelines/${pipelineId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("DUPA", pipelineId);
      return json({});
    },
  })(actionArgs);
}
