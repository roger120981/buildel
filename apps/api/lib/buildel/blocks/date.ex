defmodule Buildel.Blocks.Date do
  alias Buildel.Blocks.Fields.EditorField
  use Buildel.Blocks.Block
  use Buildel.Blocks.Tool

  @impl true
  def options() do
    %{
      type: "date",
      description: "An utility block that returns the current date and time (UTC).",
      groups: ["utils", "inputs / outputs"],
      inputs: [Block.text_input()],
      outputs: [Block.text_output()],
      ios: [Block.io("tool", "worker")],
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "opts"],
      "properties" => %{
        "name" => name_schema(),
        "opts" =>
          options_schema(%{
            "required" => [],
            "properties" =>
              Jason.OrderedObject.new(
                call_formatter:
                  EditorField.call_formatter(%{
                    default: "Date 📑: ",
                    minLength: 1
                  })
              )
          })
      }
    }
  end

  def get_date(pid, {:text, _text} = args) do
    GenServer.cast(pid, {:date, args})
  end

  @impl true
  def handle_cast({:date, {:text, _args}}, state) do
    state = send_stream_start(state)

    date = DateTime.utc_now() |> DateTime.to_string()

    state =
      state
      |> output("output", {:text, date})
      |> respond_to_tool("tool", {:text, date})

    {:noreply, state}
  end

  @impl true
  def handle_input("input", {_name, :text, args, _metadata}, state) do
    get_date(self(), {:text, args})
    state
  end

  @impl true
  def handle_tool("tool", "date", {_name, :text, args, _metadata}, state) do
    get_date(self(), {:text, args})
    state
  end

  @impl true
  def tools(state) do
    [
      %{
        function: %{
          name: "date",
          description: "Get the current date and time (UTC).",
          parameters_schema: %{}
        },
        call_formatter: fn args ->
          args = %{"config.args" => args, "config.block_name" => state.block.name}
          build_call_formatter(state.opts.call_formatter, args)
        end,
        response_formatter: fn _response ->
          ""
        end
      }
    ]
  end

  defp build_call_formatter(value, args) do
    args
    |> Enum.reduce(value, fn
      {key, value}, acc when is_number(value) ->
        String.replace(acc, "{{#{key}}}", value |> to_string() |> URI.encode())

      {key, value}, acc when is_binary(value) ->
        String.replace(acc, "{{#{key}}}", value |> to_string() |> URI.encode())

      {key, value}, acc when is_map(value) ->
        String.replace(acc, "{{#{key}}}", Jason.encode!(value))

      _, acc ->
        acc
    end)
  end
end
