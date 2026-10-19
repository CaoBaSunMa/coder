/**
 * Application-wide constants and configuration
 */
export const config = {
  consoleMarketingEnabled: import.meta.env.VITE_CONSOLE_MARKETING_ENABLED === "true",

  // Base URL
  baseUrl: "https://coder.example.com",

  // GitHub
  github: {
    repoUrl: "https://github.com/coder-ai/coder",
    starsFormatted: {
      compact: "215K",
      full: "215,000",
    },
  },

  // Social links
  social: {
    twitter: "https://x.com/coder",
    discord: "https://discord.gg/coder",
  },

  // Static stats (used on landing page)
  stats: {
    contributors: "950",
    commits: "20,000",
    monthlyUsers: "16M",
  },
} as const
