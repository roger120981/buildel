import { json, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { requireLogin } from "~/session.server";
import { loaderBuilder } from "~/utils.server";
import { APIKeyResponse, OrganizationResponse } from "./contracts";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");

    const apiKey = await fetch(
      APIKeyResponse,
      `/organizations/${params.organizationId}/api_key`
    );

    const organization = await fetch(
      OrganizationResponse,
      `/organizations/${params.organizationId}`
    );

    return json({ apiKey: apiKey.data, organization: organization.data });
  })(args);
}
