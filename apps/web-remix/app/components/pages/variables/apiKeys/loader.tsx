import { json, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import { ApiKeyListResponse } from "../contracts";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");

    const apiKeys = await fetch(
      ApiKeyListResponse,
      `/organizations/${params.organizationId}/keys`
    );
    return json({
      organizationId: params.organizationId,
      keys: apiKeys.data,
    });
  })(args);
}
