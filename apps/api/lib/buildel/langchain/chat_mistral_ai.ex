defmodule Buildel.Langchain.ChatModels.ChatMistralAI do
  use Ecto.Schema
  require Logger
  import Ecto.Changeset
  import LangChain.Utils.ApiOverride
  alias Buildel.Langchain.TokenUsage
  alias __MODULE__
  alias LangChain.Config
  alias LangChain.ChatModels.ChatModel
  alias LangChain.Message
  alias LangChain.MessageDelta
  alias LangChain.LangChainError
  alias LangChain.Utils
  alias LangChain.Function
  alias LangChain.FunctionParam

  @behaviour ChatModel
  @receive_timeout 60_000

  @default_endpoint "https://api.mistral.ai/v1/chat/completions"

  @primary_key false
  embedded_schema do
    field :endpoint, :string, default: @default_endpoint

    # The version of the API to use.
    field :model, :string
    field :api_key, :string

    # What sampling temperature to use, between 0 and 1. Higher values like 0.8
    # will make the output more random, while lower values like 0.2 will make it
    # more focused and deterministic.
    field :temperature, :float, default: 0.9

    # The topP parameter changes how the model selects tokens for output. Tokens
    # are selected from the most to least probable until the sum 3of their
    # probabilities equals the topP value. For example, if tokens A, B, and C have
    # a probability of 0.3, 0.2, and 0.1 and the topP value is 0.5, then the model
    # will select either A or B as the next token by using the temperature and exclude
    # C as a candidate. The default topP value is 0.95.
    field :top_p, :float, default: 1.0

    # Duration in seconds for the response to be received. When streaming a very
    # lengthy response, a longer time limit may be required. However, when it
    # goes on too long by itself, it tends to hallucinate more.
    field :receive_timeout, :integer, default: @receive_timeout

    field :max_tokens, :integer

    field :safe_prompt, :boolean, default: false

    field :random_seed, :integer

    field :stream, :boolean, default: false
  end

  @type t :: %ChatMistralAI{}

  @create_fields [
    :endpoint,
    :model,
    :api_key,
    :temperature,
    :top_p,
    :receive_timeout,
    :max_tokens,
    :safe_prompt,
    :random_seed,
    :stream
  ]
  @required_fields [
    :model
  ]

  @spec get_api_key(t) :: String.t()
  defp get_api_key(%ChatMistralAI{api_key: api_key}) do
    # if no API key is set default to `""` which will raise an API error
    api_key || Config.resolve(:mistral_api_key)
  end

  @spec get_headers(t) :: [tuple()]
  defp get_headers(%ChatMistralAI{} = chat) do
    api_key = get_api_key(chat)

    [
      Authorization: "Bearer #{api_key}",
      "Content-Type": "application/json",
      Accept: "application/json"
    ]
  end

  @spec new(attrs :: map()) :: {:ok, t} | {:error, Ecto.Changeset.t()}
  def new(%{} = attrs \\ %{}) do
    %ChatMistralAI{}
    |> cast(attrs, @create_fields)
    |> common_validation()
    |> apply_action(:insert)
  end

  @spec new!(attrs :: map()) :: t() | no_return()
  def new!(attrs \\ %{}) do
    case new(attrs) do
      {:ok, chain} ->
        chain

      {:error, changeset} ->
        raise LangChainError, changeset
    end
  end

  defp common_validation(changeset) do
    changeset
    |> validate_required(@required_fields)
  end

  @spec for_api(t, message :: [map()], functions :: [map()]) :: %{atom() => any()}
  def for_api(%ChatMistralAI{} = mistral, messages, functions) do
    %{
      model: mistral.model,
      temperature: mistral.temperature,
      top_p: mistral.top_p,
      safe_prompt: mistral.safe_prompt,
      stream: mistral.stream,
      messages: Enum.map(messages, &ChatMistralAI.for_api/1)
    }
    |> Utils.conditionally_add_to_map(:random_seed, mistral.random_seed)
    |> Utils.conditionally_add_to_map(:max_tokens, mistral.max_tokens)
    |> Utils.conditionally_add_to_map(:tools, get_tools_for_api(functions))
  end

  defp get_tools_for_api(nil), do: []

  defp get_tools_for_api(functions) do
    get_functions_for_api(functions)
    |> Enum.map(&tool_from_api_function/1)
  end

  defp tool_from_api_function(api_function) do
    %{
      "type" => "function",
      "function" => api_function
    }
  end

  defp get_functions_for_api(nil), do: []

  defp get_functions_for_api(functions) do
    Enum.map(functions, &for_api/1)
  end

  @doc """
  Convert a LangChain structure to the expected map of data for the OpenAI API.
  """
  @spec for_api(Message.t() | Function.t()) :: %{String.t() => any()}
  def for_api(%Message{role: :assistant, function_name: fun_name} = msg)
      when is_binary(fun_name) do
    %{
      "role" => :assistant,
      "tool_calls" => [
        %{
          "type" => "function",
          "function" => %{
            "name" => fun_name,
            "arguments" => Jason.encode!(msg.arguments)
          }
        }
      ],
      "content" => msg.content
    }
  end

  def for_api(%Message{role: :function} = msg) do
    %{
      "role" => :tool,
      "name" => msg.function_name,
      "content" => msg.content
    }
  end

  def for_api(%Message{} = msg) do
    %{
      "role" => msg.role,
      "content" => msg.content
    }
  end

  # Function support
  def for_api(%Function{} = fun) do
    %{
      "name" => fun.name,
      "parameters" => get_parameters(fun)
    }
    |> Utils.conditionally_add_to_map("description", fun.description)
  end

  defp get_parameters(%Function{parameters: [], parameters_schema: nil} = _fun) do
    %{
      "type" => "object",
      "properties" => %{}
    }
  end

  defp get_parameters(%Function{parameters: [], parameters_schema: schema} = _fun)
       when is_map(schema) do
    schema
  end

  defp get_parameters(%Function{parameters: params} = _fun) do
    FunctionParam.to_parameters_schema(params)
  end

  @impl ChatModel
  def call(mistral, prompt, functions \\ [], callback_fn \\ nil)

  def call(%ChatMistralAI{} = mistral, prompt, functions, callback_fn) when is_binary(prompt) do
    messages = [
      Message.new_system!(),
      Message.new_user!(prompt)
    ]

    call(mistral, messages, functions, callback_fn)
  end

  def call(%ChatMistralAI{} = mistral, messages, functions, callback_fn) when is_list(messages) do
    if override_api_return?() do
      Logger.warning("Found override API response. Will not make live API call.")

      case get_api_override() do
        {:ok, {:ok, data} = response} ->
          # fire callback for fake responses too
          Utils.fire_callback(mistral, data, callback_fn)
          response

        # fake error response
        {:ok, {:error, _reason} = response} ->
          response

        _other ->
          raise LangChainError,
                "An unexpected fake API response was set. Should be an `{:ok, value}`"
      end
    else
      try do
        # make base api request and perform high-level success/failure checks
        case do_api_request(mistral, messages, functions, callback_fn) do
          {:error, reason} ->
            {:error, reason}

          parsed_data ->
            {:ok, parsed_data}
        end
      rescue
        err in LangChainError ->
          {:error, err.message}
      end
    end
  end

  @spec do_api_request(t(), [Message.t()], [Function.t()], (any() -> any())) ::
          list() | struct() | {:error, String.t()}
  def do_api_request(mistral, messages, functions, callback_fn, retry_count \\ 3)

  def do_api_request(_mistral, _messages, _functions, _callback_fn, 0) do
    raise LangChainError, "Retries exceeded. Connection failed."
  end

  def do_api_request(
        %ChatMistralAI{stream: false} = mistral,
        messages,
        functions,
        callback_fn,
        retry_count
      ) do
    req =
      Req.new(
        url: mistral.endpoint,
        json: for_api(mistral, messages, functions),
        headers: get_headers(mistral),
        receive_timeout: mistral.receive_timeout,
        retry: :transient,
        max_retries: 3,
        retry_delay: fn attempt -> 300 * attempt end
      )

    req
    |> Req.post()
    # parse the body and return it as parsed structs
    |> case do
      {:ok, %Req.Response{body: data}} ->
        case do_process_response(data) do
          {:error, reason} ->
            {:error, reason}

          result ->
            Utils.fire_callback(mistral, result, callback_fn)
            result
        end

      {:error, %Mint.TransportError{reason: :timeout}} ->
        {:error, "Request timed out"}

      {:error, %Mint.TransportError{reason: :closed}} ->
        # Force a retry by making a recursive call decrementing the counter
        Logger.debug(fn -> "Mint connection closed: retry count = #{inspect(retry_count)}" end)
        do_api_request(mistral, messages, functions, callback_fn, retry_count - 1)

      other ->
        Logger.error("Unexpected and unhandled API response! #{inspect(other)}")
        other
    end
  end

  def do_api_request(
        %ChatMistralAI{stream: true} = mistral,
        messages,
        functions,
        callback_fn,
        retry_count
      ) do
    Req.new(
      url: mistral.endpoint,
      json: for_api(mistral, messages, functions),
      headers: get_headers(mistral),
      receive_timeout: mistral.receive_timeout
    )
    |> Req.post(
      into: Utils.handle_stream_fn(mistral, &do_process_response(&1, callback_fn), callback_fn)
    )
    |> case do
      {:ok, %Req.Response{body: data}} ->
        data

      {:error, %LangChainError{message: reason}} ->
        {:error, reason}

      {:error, %Mint.TransportError{reason: :timeout}} ->
        {:error, "Request timed out"}

      {:error, %Mint.TransportError{reason: :closed}} ->
        # Force a retry by making a recursive call decrementing the counter
        Logger.debug(fn -> "Mint connection closed: retry count = #{inspect(retry_count)}" end)
        do_api_request(mistral, messages, functions, callback_fn, retry_count - 1)

      other ->
        Logger.error(
          "Unhandled and unexpected response from streamed post call. #{inspect(other)}"
        )

        {:error, "Unexpected response"}
    end
  end

  def do_process_response(data, callback_fn) do
    call_callback_with_token_usage(data, callback_fn)
    do_process_response(data)
  end

  # Parse a new message response
  @doc false
  @spec do_process_response(data :: %{String.t() => any()} | {:error, any()}) ::
          Message.t()
          | [Message.t()]
          | MessageDelta.t()
          | [MessageDelta.t()]
          | {:error, String.t()}
  def do_process_response(%{"choices" => choices}) when is_list(choices) do
    # process each response individually. Return a list of all processed choices
    for choice <- choices do
      do_process_response(choice)
    end
  end

  def do_process_response(
        %{"delta" => delta_body, "finish_reason" => finish, "index" => index} = _msg
      ) do
    status =
      case finish do
        nil ->
          :incomplete

        "stop" ->
          :complete

        "length" ->
          :length

        "model_length" ->
          :length

        "tool_calls" ->
          :complete

        other ->
          Logger.warning("Unsupported finish_reason in delta message. Reason: #{inspect(other)}")
          nil
      end

    function_name =
      case delta_body do
        %{"tool_calls" => calls} ->
          calls |> Enum.at(0) |> Map.get("function") |> Map.get("name")

        _other ->
          nil
      end

    arguments =
      case delta_body do
        %{"tool_calls" => calls} ->
          args = calls |> Enum.at(0) |> Map.get("function") |> Map.get("arguments")

          if is_binary(args) do
            args
          else
            nil
          end

        _other ->
          nil
      end

    # more explicitly interpret the role. We treat a "function_call" as a a role
    # while OpenAI addresses it as an "assistant". Technically, they are correct
    # that the assistant is issuing the function_call.
    role =
      case delta_body do
        %{"role" => role} -> role
        _other -> "unknown"
      end

    data =
      delta_body
      |> Map.put("role", role)
      |> Map.put("index", index)
      |> Map.put("status", status)
      |> Map.put("function_name", function_name)
      |> Map.put("arguments", arguments)

    case MessageDelta.new(data) do
      {:ok, message} ->
        message

      {:error, changeset} ->
        {:error, Utils.changeset_error_to_string(changeset)}
    end
  end

  def do_process_response(
        %{
          "finish_reason" => "tool_calls",
          "message" => %{"tool_calls" => calls}
        } = data
      ) do
    with call <- calls |> Enum.at(0) do
      case Message.new(%{
             "role" => "assistant",
             "function_name" => call["function"]["name"],
             "arguments" => call["function"]["arguments"],
             "complete" => true,
             "index" => data["index"]
           }) do
        {:ok, message} ->
          message

        {:error, changeset} ->
          {:error, Utils.changeset_error_to_string(changeset)}
      end
    end
  end

  def do_process_response(%{
        "finish_reason" => finish_reason,
        "message" => message,
        "index" => index
      }) do
    status =
      case finish_reason do
        "stop" ->
          :complete

        "length" ->
          :length

        "model_length" ->
          :length

        other ->
          Logger.warning("Unsupported finish_reason in message. Reason: #{inspect(other)}")
          nil
      end

    case Message.new(Map.merge(message, %{"status" => status, "index" => index})) do
      {:ok, message} ->
        message

      {:error, changeset} ->
        {:error, Utils.changeset_error_to_string(changeset)}
    end
  end

  def do_process_response(%{"error" => %{"message" => reason}}) do
    Logger.error("Received error from API: #{inspect(reason)}")
    {:error, reason}
  end

  def do_process_response(%{
        "message" => "Function calling is not enabled for this model" = reason,
        "object" => "error",
        "type" => "invalid_request_error"
      }) do
    {:error, reason}
  end

  def do_process_response({:error, %Jason.DecodeError{} = response}) do
    error_message = "Received invalid JSON: #{inspect(response)}"
    Logger.error(error_message)
    {:error, error_message}
  end

  def do_process_response(other) do
    Logger.error("Trying to process an unexpected response. #{inspect(other)}")
    {:error, "Unexpected response"}
  end

  defp call_callback_with_token_usage(_data, nil), do: nil

  defp call_callback_with_token_usage(%{"usage" => usage}, callback_fn) when is_map(usage),
    do: callback_fn.(TokenUsage.new!(usage))

  defp call_callback_with_token_usage(_data, _callback_fn), do: nil
end
