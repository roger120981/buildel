defmodule BuildelWeb.OrganizationPipelineRunJSON do
  alias Buildel.Pipelines.Run

  def index(%{runs: runs, pagination_params: pagination_params, total: total}) do
    %{
      data: for(run <- runs, do: data(run)),
      meta: %{
        total: total,
        page: pagination_params.page,
        per_page: pagination_params.per_page
      }
    }
  end

  def show(%{run: run}) do
    %{data: data(run)}
  end

  def start(%{run: run, outputs: outputs}) do
    %{data: data(run), outputs: outputs}
  end

  def input_file(%{file: file}) do
    %{data: file}
  end

  defp data(%Run{} = run) do
    %{
      id: run.id,
      status: run.status,
      created_at: run.inserted_at,
      config:
        Map.update(run.config, "blocks", [], fn blocks ->
          Enum.map(blocks, fn block ->
            case Buildel.Blocks.type(block["type"]) do
              nil -> nil
              _type -> block |> Map.delete("block_type")
            end
          end)
          |> Enum.filter(fn
            nil -> false
            _ -> true
          end)
        end),
      costs: costs(run),
      total_cost: run.total_cost
    }
  end

  defp costs(%Run{run_costs: %Ecto.Association.NotLoaded{}}), do: nil

  defp costs(%Run{run_costs: run_costs}) do
    for(
      run_cost <- run_costs,
      do: BuildelWeb.OrganizationPipelineRunCostJSON.show(%{run_cost: run_cost})
    )
  end
end
