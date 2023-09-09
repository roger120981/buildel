import { ActionArgs, LoaderArgs, json, redirect } from "@remix-run/node";
import { merge } from "lodash";
import { validationError } from "remix-validated-form";
import { ZodType, z } from "zod";
import { commitSession, getRemixSession } from "./session.server";
import {
  UnauthorizedError,
  UnknownAPIError,
  ValidationError,
} from "./utils/errors.server";
import { fetchTyped } from "./utils/fetch.server";

export const loaderBuilder =
  <T>(fn: (args: LoaderArgs, helpers: { fetch: typeof fetchTyped }) => T) =>
  (args: LoaderArgs) =>
    fn(args, { fetch: requestFetchTyped(args) });

export const actionBuilder =
  (handlers: {
    post?: (args: ActionArgs, helpers: { fetch: typeof fetchTyped }) => unknown;
    delete?: (
      args: ActionArgs,
      helpers: { fetch: typeof fetchTyped }
    ) => unknown;
    patch?: (
      args: ActionArgs,
      helpers: { fetch: typeof fetchTyped }
    ) => unknown;
    put?: (args: ActionArgs, helpers: { fetch: typeof fetchTyped }) => unknown;
    get?: (args: ActionArgs, helpers: { fetch: typeof fetchTyped }) => unknown;
  }) =>
  async (actionArgs: ActionArgs) => {
    const notFound = () => json(null, { status: 404 });
    try {
      switch (actionArgs.request.method) {
        case "POST":
          return handlers.post
            ? await handlers.post(actionArgs, {
                fetch: requestFetchTyped(actionArgs),
              })
            : notFound();
        case "DELETE":
          return handlers.delete
            ? await handlers.delete(actionArgs, {
                fetch: requestFetchTyped(actionArgs),
              })
            : notFound();
        case "PATCH":
          return handlers.patch
            ? await handlers.patch(actionArgs, {
                fetch: requestFetchTyped(actionArgs),
              })
            : notFound();
        case "PUT":
          return handlers.put
            ? await handlers.put(actionArgs, {
                fetch: requestFetchTyped(actionArgs),
              })
            : notFound();
        case "GET":
          return handlers.get
            ? await handlers.get(actionArgs, {
                fetch: requestFetchTyped(actionArgs),
              })
            : notFound();
      }
    } catch (e) {
      if (e instanceof ValidationError) {
        return validationError({ fieldErrors: e.fieldErrors });
      } else if (e instanceof UnauthorizedError) {
        redirect("/login");
      } else if (e instanceof UnknownAPIError) {
        const session = await getRemixSession(
          actionArgs.request.headers.get("Cookie")!
        );
        session.flash("error", "Unknown API error");
        return json(
          { error: "Unknown API error" },
          {
            status: 500,
            headers: { "Set-Cookie": await commitSession(session) },
          }
        );
      }
      throw e;
    }

    return notFound();
  };

function requestFetchTyped(actionArgs: ActionArgs): typeof fetchTyped {
  return (schema, url, options) => {
    return fetchTyped(
      schema,
      "http://127.0.0.1:4000/api" + url,
      merge(options || {}, {
        headers: {
          "Content-Type": "application/json",
          Cookie: actionArgs.request.headers.get("cookie")!,
        },
      })
    );
  };
}
