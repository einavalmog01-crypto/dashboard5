import type { EnvironmentConfig } from "@/lib/environment-config"

/**
 * Execute a command via SSH using per-environment credentials
 * coming from the Dashboard Settings page.
 */
export async function runSshCommand(
  env: EnvironmentConfig,
  command: string
): Promise<string> {
  const { Client } = await import("ssh2")

  if (!env.unix?.hostName || !env.unix?.userName) {
    throw new Error("Missing SSH configuration for this environment")
  }

  return new Promise((resolve, reject) => {
    const conn = new Client()

    conn
      .on("ready", () => {
        conn.exec(command, (err, stream) => {
          if (err) return reject(err)

          let output = ""

          stream
            .on("data", (data) => (output += data.toString()))
            .on("close", () => {
              conn.end()
              resolve(output)
            })
        })
      })
      .on("error", reject)
      .connect({
        host: env.unix.hostName,
        port: Number(env.unix.port ?? 22),
        username: env.unix.userName,

        // 🔥 KEY LOGIC: support BOTH password & key
        ...(env.unix.sshPrivateKey
          ? { privateKey: env.unix.sshPrivateKey }
          : { password: env.unix.password }),
      })
  })
}
