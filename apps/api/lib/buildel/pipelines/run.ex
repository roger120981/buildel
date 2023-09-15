defmodule Buildel.Pipelines.Run do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias Buildel.Pipelines.Pipeline

  schema "runs" do
    belongs_to(:pipeline, Pipeline)
    field(:status, Ecto.Enum, values: [created: 0, running: 1, finished: 2], default: :created)

    timestamps()
  end

  @doc false
  def changeset(run, attrs) do
    run
    |> cast(attrs, [:pipeline_id])
    |> validate_required([:pipeline_id])
    |> assoc_constraint(:pipeline)
    |> prepare_changes(fn changeset ->
      if pipeline_id = get_change(changeset, :pipeline_id) do
        query = from Pipeline, where: [id: ^pipeline_id]
        changeset.repo.update_all(query, inc: [runs_count: 1])
      end

      changeset
    end)
  end

  def start(run) do
    run |> update_status(:running) |> Buildel.Repo.update()
  end

  def finish(run) do
    run |> update_status(:finished) |> Buildel.Repo.update()
  end

  defp update_status(run, status) do
    run |> cast(%{status: status}, [:status])
  end
end
