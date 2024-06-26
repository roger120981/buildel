defmodule BuildelWeb.OrganizationPipelineRunLogsJSON do
  alias Buildel.Pipelines.AggregatedLog

  def index(%{logs: logs, metadata: metadata}) do
    %{
      data: for(log <- logs, do: data(log)),
      meta: %{
        after: metadata.after,
        before: metadata.before,
        total: metadata.total_count
      }
    }
  end

  def show(%{log: log}) do
    %{data: data(log)}
  end

  defp data(%AggregatedLog{} = log) do
    %{
      id: log.id,
      message: log.message,
      message_types: log.message_types,
      raw_logs: log.raw_logs,
      block_name: log.block_name,
      context: log.context,
      created_at: log.inserted_at
    }
  end
end
