import { app } from "electron"

type Channel = "local" | "dev" | "beta" | "prod"

const raw = import.meta.env.CODER_CHANNEL

export const CHANNEL: Channel = raw === "local" || raw === "dev" || raw === "beta" || raw === "prod" ? raw : "dev"

export const VERSION = app.isPackaged ? app.getVersion() : (process.env.CODER_VERSION ?? app.getVersion())

const appNames: Record<string, string> = {
  dev: "Coder Dev",
  beta: "Coder Beta",
  prod: "Coder",
}

const appIDs: Record<string, string> = {
  dev: "ai.coder.desktop.dev",
  beta: "ai.coder.desktop.beta",
  prod: "ai.coder.desktop",
}

// Local renderer/server mode keeps the dev application identity.
export const APP_NAME = app.isPackaged ? appNames[CHANNEL] : "Coder Dev"

export const APP_ID = app.isPackaged ? appIDs[CHANNEL] : "ai.coder.desktop.dev"
