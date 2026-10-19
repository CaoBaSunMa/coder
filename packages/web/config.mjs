const stage = process.env.SST_STAGE || "dev"

export default {
  url: stage === "production" ? "https://coder.example.com" : `https://${stage}.coder.example.com`,
  console: stage === "production" ? "https://coder.example.com/auth" : `https://${stage}.coder.example.com/auth`,
  email: "help@coder.example.com",
  socialCard: "https://social-cards.sst.dev",
  github: "https://github.com/coder-ai/coder",
  discord: "https://coder.example.com/discord",
  headerLinks: [
    { name: "app.header.home", url: "/" },
    { name: "app.header.docs", url: "/v2/docs" },
  ],
}
