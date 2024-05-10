defmodule Buildel.RunLogs do
  import Ecto.Query, warn: false
  alias Buildel.Pipelines.AggregatedLog
  alias Buildel.Repo

  @default_attrs %{
    block_name: nil,
    limit: 10
  }

  def list_run_logs(run, attrs \\ %{}) do
    attrs = Map.merge(@default_attrs, attrs)
    run_id = run.id

    base_query =
      from(l in AggregatedLog, where: l.run_id == ^run_id, order_by: [desc: l.inserted_at])

    query =
      Enum.reduce(attrs, base_query, fn
        {:block_name, block_name}, query when is_binary(block_name) ->
          from l in query, where: l.block_name == ^block_name

        {:limit, limit}, query when is_integer(limit) ->
          from l in query, limit: ^limit

        _, query ->
          query
      end)

    query |> Repo.all()
  end
end
