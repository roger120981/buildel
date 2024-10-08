import Config

# Configure your database
config :buildel, Buildel.Repo,
  username: "postgres",
  password: "postgres",
  hostname: "localhost",
  database: "buildel_dev",
  port: 54321,
  stacktrace: true,
  show_sensitive_data_on_connection_error: true,
  pool_size: 10

# For development, we disable any cache and enable
# debugging and code reloading.
#
# The watchers configuration can be used to run external
# watchers to your application. For example, we can use it
# to bundle .js and .css sources.
config :buildel, BuildelWeb.Endpoint,
  # Binding to loopback ipv4 address prevents access from other machines.
  # Change to `ip: {0, 0, 0, 0}` to allow access from other machines.
  http: [ip: {0, 0, 0, 0}, port: 4000],
  check_origin: false,
  code_reloader: true,
  debug_errors: true,
  secret_key_base: "PaafDvUuWck9JFCo7x4kCA99Zarse36TmQvoZe/iW6L1ohmH31luAd4q2RI4mlU4",
  watchers: []

# ## SSL Support
#
# In order to use HTTPS in development, a self-signed
# certificate can be generated by running the following
# Mix task:
#
#     mix phx.gen.cert
#
# Run `mix help phx.gen.cert` for more information.
#
# The `http:` config above can be replaced with:
#
#     https: [
#       port: 4001,
#       cipher_suite: :strong,
#       keyfile: "priv/cert/selfsigned_key.pem",
#       certfile: "priv/cert/selfsigned.pem"
#     ],
#
# If desired, both `http:` and `https:` keys can be
# configured to run both http and https servers on
# different ports.

# Enable dev routes for dashboard and mailbox
config :buildel, dev_routes: true

# Do not include metadata nor timestamps in development logs
config :logger, :console, format: "[$level] $message\n"

# Set a higher stacktrace during development. Avoid configuring such
# in production as building large stacktraces may be expensive.
config :phoenix, :stacktrace_depth, 20

# Initialize plugs at runtime for faster development compilation
config :phoenix, :plug_init_mode, :runtime

# Disable swoosh api client as it is only required for production adapters.
config :swoosh, :api_client, false

config :qdrant,
  port: 6333,
  interface: "rest",
  database_url: "http://localhost",
  api_key: "doesntmatter"

config :buildel, :secret_key_base, "secret_key_base"

config :logger, level: :info

config :buildel, Buildel.Vault,
  ciphers: [
    default:
      {Cloak.Ciphers.AES.GCM,
       tag: "AES.GCM.V1", key: Base.decode64!("SXgbxNqc73TsknZpgmCNS51pJAinwb4EA3dnd8kYdup=")}
  ]

config :langchain, openai_key: fn -> System.get_env("OPENAI_API_KEY") end

config :buildel, :basic_auth, username: "michalmichal", password: "rzadzirzadzi"

config :buildel, :nlm_api_url, "http://localhost:5010"

config :buildel, :page_url, "http://localhost:3000"

config :open_api_spex, :cache_adapter, OpenApiSpex.Plug.NoneCache

config :buildel, :flame_worker, :dev

config :buildel,
       :registration_disabled,
       System.get_env("REGISTRATION_DISABLED", "false") == "true"

config :buildel, :skip_flame, System.get_env("SKIP_FLAME", "false") == "true"
