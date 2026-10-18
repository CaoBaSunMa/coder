<p align="center">
  <a href="https://coder.example.com">
    <picture>
      <source srcset="packages/console/app/src/asset/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="packages/console/app/src/asset/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
      <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="Coder logo">
    </picture>
  </a>
</p>
<p align="center">The open source AI coding agent.</p>
<p align="center">
  <a href="https://coder.example.com/discord"><img alt="Discord" src="https://img.shields.io/discord/1391832426048651334?style=flat-square&label=discord" /></a>
  <a href="https://www.npmjs.com/package/@xcoder/cli"><img alt="npm" src="https://img.shields.io/npm/v/@xcoder/cli?style=flat-square" /></a>
  <a href="https://github.com/coder-ai/coder/actions/workflows/publish.yml"><img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/coder-ai/coder/publish.yml?style=flat-square&branch=dev" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh.md">简体中文</a> |
  <a href="README.zht.md">繁體中文</a> |
  <a href="README.ko.md">한국어</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.es.md">Español</a> |
  <a href="README.fr.md">Français</a> |
  <a href="README.it.md">Italiano</a> |
  <a href="README.da.md">Dansk</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.pl.md">Polski</a> |
  <a href="README.ru.md">Русский</a> |
  <a href="README.bs.md">Bosanski</a> |
  <a href="README.ar.md">العربية</a> |
  <a href="README.no.md">Norsk</a> |
  <a href="README.br.md">Português (Brasil)</a> |
  <a href="README.th.md">ไทย</a> |
  <a href="README.tr.md">Türkçe</a> |
  <a href="README.uk.md">Українська</a> |
  <a href="README.bn.md">বাংলা</a> |
  <a href="README.gr.md">Ελληνικά</a> |
  <a href="README.vi.md">Tiếng Việt</a>
</p>

[![Coder Terminal UI](packages/web/src/assets/lander/screenshot.png)](https://coder.example.com)

---

### Installation

```bash
# YOLO
curl -fsSL https://coder.example.com/install | bash

# Package managers
npm i -g @xcoder/cli@latest      # or bun/pnpm/yarn
scoop install opencode             # Windows
choco install opencode             # Windows
brew install anomalyco/tap/opencode # macOS and Linux (recommended, always up to date)
brew install opencode              # macOS and Linux (official brew formula, updated less)
sudo pacman -S opencode            # Arch Linux (Stable)
paru -S coder-bin               # Arch Linux (Latest from AUR)
mise use -g opencode               # Any OS
nix run nixpkgs#opencode           # or github:coder-ai/coder for latest dev branch
```

> [!TIP]
> Remove versions older than 0.1.x before installing.

### Desktop App (BETA)

Coder is also available as a desktop application. Download directly from the [releases page](https://github.com/coder-ai/coder/releases) or [coder.example.com/download](https://coder.example.com/download).

| Platform              | Download                           |
| --------------------- | ---------------------------------- |
| macOS (Apple Silicon) | `coder-desktop-mac-arm64.dmg`   |
| macOS (Intel)         | `coder-desktop-mac-x64.dmg`     |
| Windows               | `coder-desktop-windows-x64.exe` |
| Linux                 | `.deb`, `.rpm`, or `.AppImage`     |

```bash
# macOS (Homebrew)
brew install --cask coder-desktop
# Windows (Scoop)
scoop bucket add extras; scoop install extras/coder-desktop
```

#### Installation Directory

The install script respects the following priority order for the installation path:

1. `$CODER_INSTALL_DIR` - Custom installation directory
2. `$XDG_BIN_DIR` - XDG Base Directory Specification compliant path
3. `$HOME/bin` - Standard user binary directory (if it exists or can be created)
4. `$HOME/.coder/bin` - Default fallback

```bash
# Examples
CODER_INSTALL_DIR=/usr/local/bin curl -fsSL https://coder.example.com/install | bash
XDG_BIN_DIR=$HOME/.local/bin curl -fsSL https://coder.example.com/install | bash
```

### Agents

Coder includes two built-in agents you can switch between with the `Tab` key.

- **build** - Default, full-access agent for development work
- **plan** - Read-only agent for analysis and code exploration
  - Denies file edits by default
  - Asks permission before running bash commands
  - Ideal for exploring unfamiliar codebases or planning changes

Also included is a **general** subagent for complex searches and multistep tasks.
This is used internally and can be invoked using `@general` in messages.

Learn more about [agents](https://coder.example.com/docs/agents).

### Documentation

For more info on how to configure Coder, [**head over to our docs**](https://coder.example.com/docs).

### Contributing

If you're interested in contributing to Coder, please read our [contributing docs](./CONTRIBUTING.md) before submitting a pull request.

### Building on Coder

If you are working on a project that's related to Coder and is using "coder" as part of its name, for example "coder-dashboard" or "coder-mobile", please add a note to your README to clarify that it is not built by the Coder team and is not affiliated with us in any way.

---

**Join our community** [Discord](https://discord.gg/opencode) | [X.com](https://x.com/opencode)
