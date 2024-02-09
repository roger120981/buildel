import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { z } from "zod";
import { requireLogin } from "~/session.server";
import { loaderBuilder } from "~/utils.server";
import { routes } from "~/utils/routes.utils";
import { getOrganizationId } from "~/utils/toast.server";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request }, { fetch }) => {
    await requireLogin(request);

    const { data: organizations } = await fetch(
      OrganizationsResponse,
      `/organizations`
    );

    const organizationId = await getOrganizationId(request.headers.get("Cookie") || "");
    const savedOrganizationIndex = organizations.data.findIndex((org) => org.id === organizationId);
    const organization = organizations.data.at(savedOrganizationIndex);

    if (organization) {
      return redirect(routes.pipelines(organization.id));
    } else {
      return redirect(routes.newOrganization());
    }
  })(args);
}

const OrganizationsResponse = z.object({
  data: z.array(
    z.object({
      id: z.number(),
    })
  ),
});
