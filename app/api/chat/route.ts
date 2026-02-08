import { runSshCommand } from "@/lib/ssh/run-ssh-command.server"
import type { EnvironmentConfig } from "@/lib/environment-config"

interface ChatRequest {
  message: string
  environment: string
  config: {
    auth: { username: string; password: string }
    endpoint: { host: string }
    unix: { hostName: string; port: string; userName: string; password: string }
  }
}

export async function POST(req: Request) {
  try {
    const body: ChatRequest = await req.json()
    const { message, environment, config } = body

    if (!environment || !config?.unix?.hostName) {
      return new Response(
        JSON.stringify({ error: "Missing environment configuration. Please configure the environment in Settings." }),
        { status: 400 }
      )
    }

    // Build a minimal EnvironmentConfig for runSshCommand
    const env = {
      name: environment,
      unix: config.unix,
      auth: config.auth,
      endpoint: config.endpoint,
    } as EnvironmentConfig

    // Call JESI chat handler
    const reply = await runSshCommand(
      env,
      `cd /jesi/chat && ./chat_handler.sh "${message.replace(/"/g, '\\"')}"`
    )

    return new Response(JSON.stringify({ reply }), { status: 200 })
  } catch (err) {
    console.error("Chat API error:", err)
    return new Response(JSON.stringify({ error: "Failed to get response" }), {
      status: 500,
    })
  }
}
