import { json, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { requireLogin } from "~/session.server";
import { loaderBuilder } from "~/utils.server";
import { PipelineApi } from "~/api/pipeline/PipelineApi";
import { OrganizationApi } from "~/api/organization/OrganizationApi";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");

    const pipelineApi = new PipelineApi(fetch);
    const organizationApi = new OrganizationApi(fetch);

    const pipelines = await pipelineApi.getPipelines(params.organizationId);
    const { data: templates } = await organizationApi.getTemplates(
      params.organizationId
    );

    return json({
      templates,
      pipelines: pipelines.data,
      organizationId: params.organizationId,
    });
  })(args);
}
