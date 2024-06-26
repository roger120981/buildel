defmodule Buildel.Pipelines.Pipeline do
  use Ecto.Schema
  import Ecto.Changeset

  schema "pipelines" do
    field(:name, :string)
    field(:config, :map)
    field(:interface_config, :map)
    field(:budget_limit, :decimal)
    field(:logs_enabled, :boolean, default: false)

    has_many(:runs, Buildel.Pipelines.Run, on_delete: :delete_all)
    has_many(:pipeline_aliases, Buildel.Pipelines.Alias, on_delete: :delete_all)
    field(:runs_count, :integer, default: 0)

    belongs_to(:organization, Buildel.Organizations.Organization)

    timestamps()
  end

  @doc false
  def changeset(pipeline, attrs) do
    pipeline
    |> cast(attrs, [
      :name,
      :config,
      :interface_config,
      :organization_id,
      :budget_limit,
      :logs_enabled
    ])
    |> validate_required([:name, :config, :organization_id])
    |> assoc_constraint(:organization)
  end
end
