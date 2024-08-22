defmodule BuildelWeb.OrganizationToolCrawlController do
  alias Buildel.Crawler
  use BuildelWeb, :controller

  use OpenApiSpex.ControllerSpecs
  import BuildelWeb.UserAuth
  import SweetXml
  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["organization"]

  operation :sitemap,
    summary: "Get sitemap",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer, required: true],
      url: [in: :query, description: "URL", type: :string, required: true]
    ],
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.Crawls.SitemapResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def sitemap(conn, _params) do
    %{organization_id: organization_id, url: url} = conn.params

    uri = URI.parse(url) |> URI.merge("/sitemap.xml")

    user = conn.assigns.current_user

    with {:ok, _organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, %Req.Response{status: status, body: body}} when status >= 200 and status < 400 <-
           Req.get(uri, []) do
      list = body |> xpath(~x"//url/loc/text()"l) |> Enum.map(&to_string/1)

      conn
      |> put_status(:ok)
      |> render(:sitemap, sitemap: list)
    else
      {:ok, %Req.Response{}} ->
        conn
        |> put_status(:ok)
        |> render(:sitemap, sitemap: [])

      e ->
        e
    end
  end

  operation :create,
    summary: "Create crawl",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer, required: true]
    ],
    request_body: {"crawl", "application/json", BuildelWeb.Schemas.Crawls.CreateCrawlRequest},
    responses: [
      created: {"created", "application/json", BuildelWeb.Schemas.Crawls.ShowResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def create(conn, _params) do
    %{organization_id: organization_id} = conn.params

    %{url: url, max_depth: max_depth, memory_collection_id: memory_collection_id} =
      conn.body_params

    uri = URI.parse(url)

    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, collection} <-
           Buildel.Memories.get_organization_collection(organization, memory_collection_id) do
      case Crawler.crawl(url,
             max_depth: max_depth,
             url_filter: fn inc_url -> inc_url |> String.contains?(uri.host) end
           ) do
        {:ok, crawl} ->
          crawl.pages
          |> Enum.map(&process_page(&1, organization, collection))
          |> Task.await_many(60_000)

          conn
          |> put_status(:created)
          |> render(:show, crawls: [])

        {:error, %Crawler.Crawl{error: :not_all_pages_successful, pages: pages}} ->
          pages
          |> Enum.map(&process_page(&1, organization, collection))
          |> Task.await_many(60_000)

          conn
          |> put_status(:created)
          |> render(:show, crawls: [])
      end
    end
  end

  defp process_page(page, organization, collection) do
    Task.async(fn ->
      # html instead of markdown because https://github.com/nlmatics/nlm-ingestor/issues/83
      path = Temp.path!(%{suffix: ".html"})
      # page.body |> Html2Markdown.convert()
      File.write!(path, page.body)

      Buildel.Memories.create_organization_memory(organization, collection, %{
        path: path,
        type: "text/html",
        name: page.url
      })

      nil
    end)
  end
end
