defmodule Buildel.Blocks.TextOutput do
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "text_output",
      description: "A versatile module designed to output text data.",
      groups: ["text", "inputs / outputs"],
      inputs: [Block.text_input()],
      outputs: [Block.text_output("output", true)],
      ios: [],
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "inputs", "opts"],
      "properties" => %{
        "name" => name_schema(),
        "inputs" => inputs_schema(),
        "opts" =>
          options_schema(%{
            "required" => ["stream_timeout"],
            "properties" => %{
              "stream_timeout" => %{
                "type" => "number",
                "title" => "Stop after (ms)",
                "description" =>
                  "Wait this many milliseconds after receiving the last chunk before stopping the stream.",
                "minimum" => 500,
                "default" => 500,
                "step" => 1
              }
            }
          })
      }
    }
  end

  @impl true
  def handle_input("input", {_name, :text, text, _metadata}, state) do
    output(state, "output", {:text, text}, %{stream_stop: :schedule})
  end
end
