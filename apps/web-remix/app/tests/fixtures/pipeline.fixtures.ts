import { IPipeline } from "~/components/pages/pipelines/pipeline.types";

export const pipelineFixture = (override?: Partial<IPipeline>): IPipeline => {
  return {
    id: 1,
    name: "AI Chat",
    organization_id: 1,
    runs_count: 2,
    interface_config: {
      input: "text_input_1",
      output: "text_output_1",
    },
    config: {
      version: "1",
      blocks: [
        {
          name: "document_search_1",
          opts: {
            name: "document_search_1",
          },
          inputs: [],
          connections: [],
          position: {
            x: -24.355610006095844,
            y: -1060.6251483015994,
          },
          type: "document_search",
        },
        {
          name: "text_input_1",
          opts: {},
          inputs: [],
          connections: [],
          position: {
            x: -44,
            y: -846,
          },
          type: "text_input",
        },
        {
          name: "chat_123321",
          opts: {
            api_key: "open ai",
            api_type: "openai",
            chat_memory_type: "full",
            description: "",
            endpoint: "https://api.openai.com/v1/chat/completions",
            messages: [],
            model: "gpt-3.5-turbo",
            prompt_template: "{{text_input_1:output}}",
            system_message: "1",
            temperature: 0.7,
          },
          inputs: ["text_input_1:output->input?reset=true"],
          connections: [
            {
              from: {
                block_name: "text_input_1",
                output_name: "output",
              },
              to: {
                block_name: "chat_1",
                input_name: "input",
              },
              opts: {
                reset: true,
              },
            },
          ],
          position: {
            x: 327,
            y: -952,
          },
          type: "chat",
        },
        {
          name: "text_output_1",
          opts: {
            stream_timeout: 500,
          },
          inputs: ["chat_1:output->input?reset=true"],
          connections: [
            {
              from: {
                block_name: "chat_1",
                output_name: "output",
              },
              to: {
                block_name: "text_output_1",
                input_name: "input",
              },
              opts: {
                reset: true,
              },
            },
          ],
          position: {
            x: 764,
            y: -837,
          },
          type: "text_output",
        },
      ],
      connections: [
        {
          from: {
            block_name: "text_input_1",
            output_name: "output",
          },
          to: {
            block_name: "chat_123321",
            input_name: "input",
          },
          opts: {
            reset: true,
          },
        },
        {
          from: {
            block_name: "chat_123321",
            output_name: "output",
          },
          to: {
            block_name: "text_output_1",
            input_name: "input",
          },
          opts: {
            reset: true,
          },
        },
      ],
    },
    ...override,
  };
};

const t = {
  name: "document_search_1",
  opts: {
    name: "document_search_1",
  },
  inputs: [],
  connections: [],
  position: {
    x: -24.355610006095844,
    y: -1060.6251483015994,
  },
  type: "document_search",
};
