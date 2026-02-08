export interface JiraConfig {
  baseUrl: string
  email: string
  apiToken: string
  projectKey: string
  boardId: string
  isConfigured: boolean
}

export const defaultJiraConfig: JiraConfig = {
  baseUrl: "https://deljira",
  email: "",
  apiToken: "",
  projectKey: "VFDE",
  boardId: "4033",
  isConfigured: false,
}

const STORAGE_KEY = "jira-config"

export function loadJiraConfig(): JiraConfig {
  if (typeof window === "undefined") return defaultJiraConfig
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : defaultJiraConfig
  } catch {
    return defaultJiraConfig
  }
}

export function saveJiraConfig(config: JiraConfig) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    // Ignore errors
  }
}

export function isJiraConfigured(config: JiraConfig): boolean {
  return !!(config.baseUrl && config.email && config.apiToken && config.projectKey && config.boardId)
}
