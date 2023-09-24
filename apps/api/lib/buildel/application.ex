defmodule Buildel.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children =
      [
        # Start the Telemetry supervisor
        BuildelWeb.Telemetry,
        # Start the Ecto repository
        Buildel.Repo,
        # Start the PubSub system
        {Phoenix.PubSub, name: Buildel.PubSub},
        # Start Finch
        {Finch, name: Buildel.Finch},
        # Start the Endpoint (http/https)
        BuildelWeb.Endpoint,
        # Start a worker by calling: Buildel.Worker.start_link(arg)
        Buildel.Pipelines.Runner
        # Start the python poolboy
        # :poolboy.child_spec(:worker, python_poolboy_config())
      ]
      |> maybe_add_bumblebee_embedding()
      |> maybe_add_hybrid_db_embedding()
      |> maybe_add_python_workers()

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Buildel.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    BuildelWeb.Endpoint.config_change(changed, removed)
    :ok
  end

  defp maybe_add_bumblebee_embedding(children) do
    if Application.get_env(:buildel, :embeddings) == Buildel.Clients.BumblebeeEmbeddings do
      children ++
        [
          {Nx.Serving,
           serving: Buildel.Clients.BumblebeeEmbeddings.serving(),
           name: Buildel.Clients.BumblebeeEmbeddings,
           batch_timeout: 100}
        ]
    else
      children
    end
  end

  defp maybe_add_hybrid_db_embedding(children) do
    if Mix.env() != :test do
      children ++
        [
          {Nx.Serving,
           serving: Buildel.HybridDB.serving(),
           name: Buildel.HybridDB,
           batch_timeout: 100,
           batch_size: 4}
        ]
    else
      children
    end
  end

  defp maybe_add_python_workers(children) do
    if Application.get_env(:buildel, :file_loader) == Buildel.FileLoaderUnstructuredLocalAdapter do
      children ++
        [
          :poolboy.child_spec(:worker, python_poolboy_config())
        ]
    else
      children
    end
  end

  defp python_poolboy_config() do
    [
      {:name, {:local, :python_worker}},
      {:worker_module, Buildel.PythonWorker},
      {:size, 2},
      {:max_overflow, 0}
    ]
  end
end
