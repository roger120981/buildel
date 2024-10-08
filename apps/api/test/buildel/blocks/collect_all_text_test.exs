defmodule Buildel.Blocks.CollectAllTextTest do
  use Buildel.BlockCase, async: true
  alias Blocks.CollectAllText

  test "exposes options" do
    assert CollectAllText.options() == %{
             type: "collect_all_text",
             description:
               "This module specializes in accumulating and consolidating text input from streaming sources.",
             inputs: [Block.text_input(), Block.text_input("drain"), Block.text_input("reset")],
             outputs: [Block.text_output("output")],
             schema: CollectAllText.schema(),
             groups: ["text", "utils"],
             ios: [],
             dynamic_ios: nil
           }
  end

  test "validates schema correctly" do
    assert :ok =
             Blocks.validate_block(CollectAllText, %{
               "name" => "test",
               "opts" => %{
                 "drain_signal" => "any",
                 "join_as" => "string",
                 "reset_signal" => "any"
               },
               "inputs" => []
             })

    assert {:error, _} = Blocks.validate_block(CollectAllText, %{})
  end
end
