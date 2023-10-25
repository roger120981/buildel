defmodule Buildel.PipelinesFixtures do
  import Buildel.OrganizationsFixtures

  def pipeline_fixture(attrs \\ %{}) do
    {:ok, pipeline} =
      attrs
      |> Enum.into(%{
        name: "some name",
        organization_id: organization_fixture().id,
        config: %{
          "version" => "1",
          "blocks" => [
            %{
              "name" => "random_block",
              "type" => "audio_input",
              "opts" => %{}
            },
            %{
              "name" => "random_block_2",
              "type" => "speech_to_text",
              "opts" => %{},
              "inputs" => ["random_block:output"]
            },
            %{
              "name" => "random_block_3",
              "type" => "text_output",
              "opts" => %{},
              "inputs" => ["random_block_2:output"]
            },
            %{
              "name" => "random_block_4",
              "type" => "audio_output",
              "opts" => %{},
              "inputs" => ["random_block:output"]
            }
          ]
        }
      })
      |> Buildel.Pipelines.create_pipeline()

    pipeline
  end

  def run_fixture(attrs \\ %{}) do
    pipeline = pipeline_fixture()

    {:ok, run} =
      attrs
      |> Enum.into(%{
        pipeline_id: pipeline.id,
        config: pipeline.config
      })
      |> Buildel.Pipelines.create_run()

    run
  end
end
